import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Fieldset,
  Group,
  Input,
  Loader,
  NativeSelect,
  NumberInput,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { IMaskInput } from "react-imask";
import { zeitenMask } from "../../utils/input-mask.ts";
import { buildKonfiguration } from "../../lib/schwimmen/eingabe/konfiguration.ts";
import {
  Hyperparameters,
  Progress,
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
import { max, sortBy, sum, uniq } from "lodash-es";
import { formatMaskedTime } from "../../utils/masking.ts";
import { IconCheck, IconX } from "@tabler/icons-react";
import { StaffelValidity } from "../../lib/schwimmen/search/score/staffel.ts";

function onlyNumbers(value: string | number): number {
  return typeof value === "number" ? value : 0;
}

function schwimmerIndexIdMapping(swimmers: Map<number, Swimmer>): number[] {
  return Array.from(swimmers.values())
    .filter((s) => s.present)
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
  const [disciplines, swimmers, relays, teamSettings, updateTeamSettings] = useCombinedStore(
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
  const [progress, setProgress] = useState<Progress | undefined>(undefined);
  const ageGroups = uniq(Array.from(swimmers.values(), (s) => s.ageGroup)).sort();
  const [ageGroup, setAgeGroup] = useState<string>(ageGroups[0]);

  async function berechnen() {
    const swimmersForSearch: Map<number, Swimmer> = new Map(
      Array.from(swimmers.entries()).filter(([, s]) => s.ageGroup === ageGroup),
    );
    try {
      setRunning(true);
      // TODO check no duplicate discipline names
      const konfiguration = buildKonfiguration({
        parameters: {
          ...teamSettings,
          maxZeitspanneProStaffelSeconds: parseZeit(teamSettings.maxZeitspanneProStaffelSeconds),
        },
        schwimmerList: schwimmerIndexIdMapping(swimmersForSearch).map((id) =>
          mapSwimmerToSchwimmer(swimmersForSearch.get(id)!, disciplines),
        ),
        geschlecht: new Map(
          Array.from(swimmersForSearch.values(), (swimmer) => [swimmer.name, mapGenderToGeschlecht(swimmer.gender)]),
        ),
        minMax: new Map(
          Array.from(swimmersForSearch.values(), (swimmer) => [
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

      const { state } = await runCrappySimulatedAnnealing(konfiguration, hyperparameters, false, (gen) =>
        setProgress(gen),
      );

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
            relays: relayResults,
            totalSeconds: sum(relayResults.map((r) => r.totalSeconds)),
          };
        }),
      });
    } finally {
      setRunning(false);
    }
  }

  function renderRelayResult(relay: RelayResult, relayIndex: number, teamIndex: number) {
    const legsSorted = sortBy(relay.legs, (l) => l.swimmerName);
    const relayValidity: StaffelValidity | undefined =
      progress?.validity?.teamValidities[teamIndex]?.staffelValidities[relayIndex];
    return (
      <Box>
        <h4
          style={{
            color: relayValidity && relayValidity.valid ? undefined : "var(--mantine-color-error)",
          }}
        >
          {relay.staffelName}
        </h4>

        <Table
          withTableBorder
          withRowBorders={false}
          style={{
            borderColor: relayValidity && relayValidity.valid ? undefined : "var(--mantine-color-error)",
          }}
          data={{
            body: legsSorted.map((leg) => [leg.swimmerName, formatMaskedTime(leg.seconds)]),
            foot: ["Gesamt", formatMaskedTime(relay.totalSeconds)],
          }}
        />
        {relayValidity && (
          <Stack
            style={{
              color: relayValidity && relayValidity.valid ? undefined : "var(--mantine-color-error)",
            }}
          >
            <Space />
            {relayValidity.minOneFemaleViolations > 0 && <Text size="xs">Mindestens ein Mädchen benötigt</Text>}
            {relayValidity.minOneMaleViolations > 0 && "min one male"}
            {relayValidity.maxOneStartProSchwimmerViolations > 0 && "max one start pro schwimmer"}
          </Stack>
        )}
      </Box>
    );
  }

  function violationErrorText(violations: number | undefined, text: string) {
    return <Text style={{ color: "var(--mantine-color-error)" }}>{violations ?? 0 !== 0 ? text : undefined}</Text>;
  }

  function renderTeamResult(team: TeamResult, teamIndex: number) {
    const swimmerCounts = new Map<string, number>();
    team.relays.forEach((relay) => {
      relay.legs.forEach((leg) => {
        if (!swimmerCounts.has(leg.swimmerName)) {
          swimmerCounts.set(leg.swimmerName, 0);
        }
        swimmerCounts.set(leg.swimmerName, swimmerCounts.get(leg.swimmerName)! + 1);
      });
    });
    const swimmerNames = uniq(team.relays.flatMap((relay) => relay.legs).flatMap((leg) => leg.swimmerName)).sort();
    return (
      <>
        <h3>Team {teamIndex + 1}</h3>
        <Text>Gesamtzeit: {formatMaskedTime(team.totalSeconds)}</Text>
        <Box>
          {violationErrorText(
            progress?.validity?.teamValidities[teamIndex]?.minSchwimmerViolations,
            "Min Schwimmer nicht eingehalten",
          )}
          {violationErrorText(
            progress?.validity?.teamValidities[teamIndex]?.maxSchwimmerViolations,
            "Max Schwimmer nicht eingehalten",
          )}
          {violationErrorText(
            progress?.validity?.teamValidities[teamIndex]?.minMaleViolations,
            "Min Jungen pro Team nicht eingehalten",
          )}
          {violationErrorText(
            progress?.validity?.teamValidities[teamIndex]?.minFemaleViolations,
            "Min Mädchen pro Team nicht eingehalten",
          )}
        </Box>
        <SimpleGrid cols={3} spacing="xl" verticalSpacing="xs">
          {team.relays.map((relay, relayIndex) => renderRelayResult(relay, relayIndex, teamIndex))}
          <Box>
            <h4>Schwimmer</h4>
            <Table
              withTableBorder
              withRowBorders={false}
              data={{
                body: swimmerNames.map((it) => [it, `${swimmerCounts.get(it)!}x`]),
              }}
            />
          </Box>
        </SimpleGrid>
      </>
    );
  }

  function renderResult(result: Result) {
    return <Stack>{result.teams.map((team, index) => renderTeamResult(team, index))}</Stack>;
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
                  label="Min Schwimmer pro Team"
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
                  label="Min Jungen pro Team"
                  min={0}
                  value={teamSettings.minMaleProTeam}
                  onChange={(value) => updateTeamSettings({ minMaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
                <NumberInput
                  label="Min Mädchen pro Team"
                  min={0}
                  value={teamSettings.minFemaleProTeam}
                  onChange={(value) => updateTeamSettings({ minFemaleProTeam: onlyNumbers(value) })}
                ></NumberInput>
              </Stack>
            </Fieldset>
            <Fieldset legend="Max">
              <Stack>
                <NumberInput
                  label="Max Schwimmer pro Team"
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
            <Group justify="stretch">
              <NativeSelect
                style={{ flexGrow: 1 }}
                data={ageGroups}
                value={ageGroup}
                onChange={(evt) => setAgeGroup(evt.currentTarget.value)}
              />
              <Button
                style={{ flexGrow: 1 }}
                onClick={() => berechnen()}
                loading={running}
                loaderProps={{ type: "dots" }}
              >
                Los
              </Button>
            </Group>
            <Divider />
            {progress && (
              <>
                <Table
                  data={{
                    head: ["Generationen", "Geprüfte Kombinationen", "Score", "Ergebnis Valide"],
                    body: [
                      [
                        progress.gen.toLocaleString(),
                        progress.statesChecked.toLocaleString(),
                        formatMaskedTime(progress.score),
                        progress.validity.valid ? <IconCheck color="green" /> : <IconX color="red" />,
                      ],
                    ],
                  }}
                />
              </>
            )}
          </Stack>
        </Paper>

        <Box style={{ position: "relative" }}>
          {
            <Paper
              withBorder
              shadow="md"
              p="xl"
              style={{ borderColor: result === undefined || progress?.validity?.valid ? undefined : "red" }}
            >
              <h2>Ergebnis</h2>

              <Box>
                {violationErrorText(
                  progress?.validity?.minStartsProSchwimmerViolations,
                  "Min Starts pro Schwimmer nicht eingehalten",
                )}
                {violationErrorText(
                  progress?.validity?.maxStartsProSchwimmerViolations,
                  "Max Starts pro Schwimmer nicht eingehalten",
                )}
                {violationErrorText(
                  progress?.validity?.alleMuessenSchwimmenViolations,
                  "Alle müssen schwimmen nicht eingehalten",
                )}
                {violationErrorText(
                  progress?.validity?.schwimmerInMehrerenTeamsViolations,
                  "Es gibt Schwimmer, die in mehreren Teams schwimmen",
                )}
                {violationErrorText(
                  progress?.validity?.zeitspannePenaltySeconds,
                  "Maximale Staffelzeitendifferenz nicht eingehalten",
                )}
              </Box>

              <Stack>{result && renderResult(result)}</Stack>

              {running && (
                <Box
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    background: "white",
                    opacity: "80%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Loader type="dots" size="xl" color="black" />
                </Box>
              )}
            </Paper>
          }
        </Box>
      </Stack>
    </Container>
  );
}
