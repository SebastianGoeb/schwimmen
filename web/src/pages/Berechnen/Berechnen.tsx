import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Fieldset,
  Input,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useStore } from "../../services/state.ts";
import { useShallow } from "zustand/react/shallow";
import { IMaskInput } from "react-imask";
import { zeitenMask } from "../../utils/input-mask.ts";
import { buildKonfiguration } from "../../lib/schwimmen/eingabe/konfiguration.ts";
import {
  Hyperparameters,
  runCrappySimulatedAnnealing,
} from "../../lib/schwimmen/search/sa/crappy-simulated-annealing.ts";
import { mutateRandom, mutateVerySmart } from "../../lib/schwimmen/search/sa/mutation.ts";
import { compareByYearThenGenderThenLastname, Swimmer } from "../../model/swimmer.ts";
import { Schwimmer } from "../../lib/schwimmen/eingabe/zeiten.ts";
import { parseZeit } from "../../lib/schwimmen/util/zeit.ts";
import { Discipline } from "../../model/discipline.ts";
import { Geschlecht } from "../../lib/schwimmen/eingabe/geschlecht.ts";
import { Gender } from "../../model/gender.ts";
import { useState } from "react";
import { max, sum, uniq } from "lodash-es";
import { formatMaskedTime } from "../../utils/masking.ts";

function onlyNumbers(value: string | number): number {
  return typeof value === "number" ? value : 0;
}

function schwimmerIndexIdMapping(swimmers: Map<number, Swimmer>): number[] {
  return Array.from(swimmers.values())
    .sort(compareByYearThenGenderThenLastname)
    .map((swimmer) => swimmer.id);
}

function mapSwimmerToSchwimmer(swimmer: Swimmer, disciplines: Discipline[]): Schwimmer {
  return {
    name: swimmer.name,
    zeitenSeconds: new Map(
      Array.from(swimmer.lapTimes.entries())
        .filter(([, lapTime]) => lapTime.enabled)
        .map(([disciplineId, lapTime]): [string, number | undefined] => [
          disciplines.find((d) => d.id === disciplineId)!.name,
          parseMaskedZeitToSeconds(lapTime.seconds),
        ])
        .filter((pair): pair is [string, number] => pair[1] !== undefined),
    ),
  };
}

function parseMaskedZeitToSeconds(zeit: string): number | undefined {
  const cleaned = zeit.replace(/[:,]/g, "");
  if (cleaned === "" || cleaned == "______") {
    return undefined;
  }

  // TODO handle partially filled strings (e.g. 12:_5,10) with error
  const cleaned2 = cleaned.replace(/_/g, "0");

  const min = Number(cleaned2.slice(0, 2));
  const sec = Number(cleaned2.slice(2, 4));
  const cent = Number(cleaned2.slice(4, 6));

  return min * 60 + sec + cent / 100;
}

function mapGenderToGeschlecht(gender: Gender): Geschlecht {
  return gender === Gender.M ? Geschlecht.MALE : Geschlecht.FEMALE;
}

interface Result {
  teams: TeamResult[];
}

interface TeamResult {
  swimmerNames: string[];
  relays: RelayResult[];
  totalSeconds: number;
}

interface RelayResult {
  staffelName: string;
  legs: RelayLegResult[];
  totalSeconds: number;
}

interface RelayLegResult {
  swimmerName: string;
  seconds: number;
}

export default function Berechnen() {
  const [disciplines, swimmers, relays, teamSettings, updateTeamSettings] = useStore(
    useShallow((state) => [
      state.disciplines,
      state.swimmers,
      state.relays,
      state.teamSettings,
      state.updateTeamSettings,
    ]),
  );
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | undefined>(undefined);

  async function berechnen() {
    try {
      setRunning(true);
      // TODO check no duplicate discipline names
      const konfiguration = buildKonfiguration({
        parameters: {
          ...teamSettings,
          maxZeitspanneProStaffelSeconds: parseZeit(teamSettings.maxZeitspanneProStaffelSeconds),
        },
        schwimmerList: schwimmerIndexIdMapping(swimmers).map((id) =>
          mapSwimmerToSchwimmer(swimmers.get(id)!, disciplines),
        ),
        geschlecht: new Map(
          Array.from(swimmers.values(), (swimmer) => [swimmer.name, mapGenderToGeschlecht(swimmer.gender)]),
        ),
        minMax: new Map(
          Array.from(swimmers.values(), (swimmer) => [
            swimmer.name,
            { min: swimmer.minStarts, max: swimmer.maxStarts },
          ]),
        ),
        staffeln: Array.from(relays.values(), (relay) => ({
          name: relay.name,
          disziplinen: relay.legs.flatMap((leg) =>
            new Array(leg.times).fill(disciplines.find((d) => d.id === leg.disciplineId)!.name),
          ),
          team: relay.team,
        })),
      });

      const hyperparameters: Hyperparameters = {
        smartMutationRate: 0.85,
        smartMutation: mutateVerySmart,
        dumbMutation: mutateRandom,
        acceptanceProbability: 0.1,
        globalGenerationLimit: 50,
        restartGenerationLimit: 20,
        maxGenerations: 1_000_000,
        populationSize: 10,
      };

      const { state, duration, checked } = await runCrappySimulatedAnnealing(konfiguration, hyperparameters);
      console.log(state, duration, checked);

      setResult({
        teams: state.state.teams.map((team) => {
          const relayResults = team.staffelBelegungen.map((sb) => {
            const legs = sb.startBelegungen.map((swimmerIdx, startIdx) => {
              const disziplinId = konfiguration.staffeln[sb.staffelId].disziplinIds[startIdx];
              return {
                swimmerName: konfiguration.schwimmerList[swimmerIdx].name,
                seconds: konfiguration.disziplinToSchwimmerToZeit[disziplinId][swimmerIdx]!,
              };
            });
            return {
              staffelName: konfiguration.staffeln[sb.staffelId].name,
              legs,
              totalSeconds: konfiguration.staffeln[sb.staffelId].team
                ? max(legs.map((leg) => leg.seconds))!
                : sum(legs.map((leg) => leg.seconds)),
            };
          });
          return {
            swimmerNames: uniq(relayResults.flatMap((r) => r.legs.flatMap((leg) => leg.swimmerName))), // TODO
            relays: relayResults,
            totalSeconds: sum(relayResults.map((r) => r.totalSeconds)),
          };
        }),
      });
    } finally {
      setRunning(false);
    }
  }

  function renderResult(result: Result): React.ReactNode {
    return (
      <Stack>
        {result.teams.map((team, index) => (
          <>
            <h3>Team {index + 1}</h3>
            <Text>Gesamtzeit: {formatMaskedTime(team.totalSeconds)}</Text>
            <SimpleGrid cols={3} spacing="xl" verticalSpacing="xs">
              {team.relays.map((relay) => (
                <Box>
                  <h4>{relay.staffelName}</h4>

                  <Table
                    withTableBorder
                    withRowBorders={false}
                    data={{
                      body: relay.legs.map((leg) => [leg.swimmerName, formatMaskedTime(leg.seconds)]),
                      foot: ["Gesamt", formatMaskedTime(relay.totalSeconds)],
                    }}
                  />
                </Box>
              ))}
            </SimpleGrid>

            <h4>Schwimmer</h4>
            <Table
              data={{
                body: team.swimmerNames.map((it) => [it]),
              }}
            />
          </>
        ))}
      </Stack>
    );
  }

  return (
    <Container size="xl">
      <h1>Berechnen</h1>

      <Stack>
        <Paper withBorder shadow="md" p="xl">
          <h2>Einstellungen</h2>
          <SimpleGrid cols={2}>
            <Fieldset legend="Min">
              <Stack>
                <NumberInput
                  label="Min Schwimmer"
                  min={0}
                  value={teamSettings.minSchwimmerProTeam}
                  onChange={(value) => updateTeamSettings({ minSchwimmerProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Starts pro Schwimmer"
                  min={0}
                  value={teamSettings.minStartsProSchwimmer}
                  onChange={(value) => updateTeamSettings({ minStartsProSchwimmer: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Jungen"
                  min={0}
                  value={teamSettings.minMaleProTeam}
                  onChange={(value) => updateTeamSettings({ minMaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Mädchen"
                  min={0}
                  value={teamSettings.minFemaleProTeam}
                  onChange={(value) => updateTeamSettings({ minFemaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
              </Stack>
            </Fieldset>
            <Fieldset legend="Max">
              <Stack>
                <NumberInput
                  label="Max Schwimmer"
                  min={0}
                  value={teamSettings.maxSchwimmerProTeam}
                  onChange={(value) => updateTeamSettings({ maxSchwimmerProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Max Starts pro Schwimmer"
                  min={0}
                  value={teamSettings.maxStartsProSchwimmer}
                  onChange={(value) => updateTeamSettings({ maxStartsProSchwimmer: onlyNumbers(value) })}
                ></NumberInput>
              </Stack>
            </Fieldset>
            <Fieldset legend="Teamerstellung" style={{ flexGrow: 1 }}>
              <Stack>
                <NumberInput
                  label="Anzahl Teams"
                  min={1}
                  value={teamSettings.anzahlTeams}
                  onChange={(value) => updateTeamSettings({ anzahlTeams: onlyNumbers(value) })}
                ></NumberInput>
                {teamSettings.anzahlTeams > 1 && (
                  <Input.Wrapper
                    label="Max Erlaubte Differenz der Staffelzeiten zweier Teams"
                    description="Eine geringe Zeitspanne kann eine schlechtere Gesamtzeit bewirken, oder sogar dass keine valide Teamzusammenstellung generiert werden kann. Zeitspanne wird je Staffel berechnet."
                  >
                    <Input
                      component={IMaskInput}
                      mask={zeitenMask()}
                      value={teamSettings.maxZeitspanneProStaffelSeconds}
                      onAccept={(value: string) => {
                        updateTeamSettings({ maxZeitspanneProStaffelSeconds: value });
                      }}
                    ></Input>
                  </Input.Wrapper>
                )}
              </Stack>
            </Fieldset>
            <Fieldset legend="Weitere" style={{ flexGrow: 1 }}>
              <Checkbox
                label="Alle müssen schwimmen"
                description="Alle anwesenden Teilnehmer müssen mindestens ein mal schwimmen. Bewirkt üblicherweise ein schlechtere Gesamtzeit."
                checked={teamSettings.alleMuessenSchwimmen}
                onChange={(evt) => {
                  updateTeamSettings({ alleMuessenSchwimmen: evt.currentTarget.checked });
                }}
              ></Checkbox>
            </Fieldset>
          </SimpleGrid>
        </Paper>

        <Paper withBorder shadow="md" p="xl">
          <h2>Berechnen</h2>

          <Stack>
            <Button onClick={() => berechnen()} loading={running} loaderProps={{ type: "dots" }}>
              Los
            </Button>
            <Divider />
            {result && renderResult(result)}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
