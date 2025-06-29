import {
  Accordion,
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
import chroma from "chroma-js";
import { useCombinedStore } from "../../services/state/state.ts";
import { useShallow } from "zustand/react/shallow";
import { IMaskInput } from "react-imask";
import { zeitenMask } from "../../utils/input-mask.ts";
import { Hyperparameters, Parameters } from "../../lib/schwimmen/eingabe/configuration.ts";
import { runCrappySimulatedAnnealing } from "../../lib/schwimmen/search/sa/crappy-simulated-annealing.ts";
import { Swimmer } from "../../model/swimmer.ts";
import { useState } from "react";
import { sortBy, throttle, uniq, uniqBy } from "lodash-es";
import { formatMaskedTime, parseMaskedZeitToSeconds } from "../../utils/masking.ts";
import { IconCheck, IconX } from "@tabler/icons-react";
import { RelayValidity } from "../../lib/schwimmen/search/score/relay.ts";
import { RelayResult, Result, TeamResult } from "../../lib/schwimmen/search/state/result.ts";
import { Progress } from "../../lib/schwimmen/search/state/progress.ts";
import { Discipline } from "../../model/discipline.ts";
import { Relay } from "../../model/relay.ts";
import { TeamSettings } from "../../model/team-settings.ts";
import { LineChart } from "@mantine/charts";

function onlyNumbers(value: string | number): number {
  return typeof value === "number" ? value : 0;
}

function formatPerformanceMetrics({ checked, duration }: Progress) {
  return {
    checked: checked.toLocaleString(),
    duration: `${duration.toFixed(1)}s`,
    rate: `${parseFloat((checked / duration).toPrecision(2)).toLocaleString()}/s`,
  };
}

const HYPERPARAMETERS: Hyperparameters = {
  smartMutationRate: 0.85,
  acceptanceProbability: 0.1,
  globalGenerationLimit: 200,
  restartGenerationLimit: 20,
  maxGenerations: 1_000_000,
  populationSize: 10,
};

function toParameters(
  disciplines: Discipline[],
  relays: Map<number, Relay>,
  swimmers: Map<number, Swimmer>,
  ageGroup: string,
  teamSettings: TeamSettings,
) {
  const disciplinesForSearch = disciplines;
  const relaysForSearch = Array.from(relays.values());
  const swimmersForSearch: Swimmer[] = Array.from(swimmers.values()).filter(
    (swimmer) => swimmer.ageGroup === ageGroup && swimmer.present,
  );
  const parameters: Parameters = {
    allMustSwim: teamSettings.alleMuessenSchwimmen,
    minSwimmersPerTeam: teamSettings.minSchwimmerProTeam,
    maxSwimmersPerTeam: teamSettings.maxSchwimmerProTeam,
    minMalesProTeam: teamSettings.minMaleProTeam,
    minFemalesProTeam: teamSettings.minFemaleProTeam,
    minStartsPerSwimmer: teamSettings.minStartsProSchwimmer,
    maxStartsPerSwimmer: teamSettings.maxStartsProSchwimmer,
    numTeams: teamSettings.anzahlTeams,
    maxTimeDifferencePerRelaySeconds: parseMaskedZeitToSeconds(teamSettings.maxZeitspanneProStaffelSeconds)!,
    disciplines: disciplinesForSearch,
    relays: relaysForSearch,
    swimmers: swimmersForSearch,
  };
  return parameters;
}

function calcDataFromProgress(progress: Progress) {
  const result = [];
  for (let generation = 0; generation < progress.history[0].length; generation++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datapoint: any = { generation: generation };
    progress.history.forEach((individual, individualIndex) => {
      datapoint[`score_${individualIndex}`] = individual[generation].score;
    });
    result.push(datapoint);
  }
  return result;
}

const colorScale = chroma.scale(["#fafa6e", "#2A4858"]).mode("lab");

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
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState<Progress | undefined>(undefined);
  const ageGroups = uniq(Array.from(swimmers.values(), (s) => s.ageGroup)).sort();
  const [ageGroup, setAgeGroup] = useState<string>(ageGroups[0]);
  const [accordionValue, setAccordionValue] = useState<string | null>(null);

  async function berechnen() {
    try {
      setRunning(true);
      const [result, finalProgress] = await runCrappySimulatedAnnealing(
        toParameters(disciplines, relays, swimmers, ageGroup, teamSettings),
        HYPERPARAMETERS,
        throttle(setProgress, 100), // don't re-render 100s of times per second
      );
      console.log(formatPerformanceMetrics(finalProgress));
      setProgress(finalProgress);
      setResults([...results, result]);
      setAccordionValue(String(result.generated));
    } finally {
      setRunning(false);
    }
  }

  function renderRelayResult(result: Result, relayResult: RelayResult, relayIndex: number, teamIndex: number) {
    // TODO correct discipline order within relay
    const legResultsSorted = sortBy(relayResult.legs, (leg) => [leg.discipline.name, leg.swimmer.name]);
    const relayValidity: RelayValidity | undefined =
      result?.validity?.teamValidities[teamIndex]?.relayValidities[relayIndex];
    return (
      <Box key={relayIndex}>
        <h4
          style={{
            color: relayValidity && relayValidity.valid ? undefined : "var(--mantine-color-error)",
          }}
        >
          {relayResult.relay.name}
        </h4>

        <Table
          withTableBorder
          withRowBorders={false}
          style={{
            borderColor: relayValidity && relayValidity.valid ? undefined : "var(--mantine-color-error)",
          }}
          data={{
            body: legResultsSorted.map((legResult) => [
              legResult.swimmer.name,
              legResult.discipline.name,
              formatMaskedTime(legResult.time),
            ]),
            foot: ["Gesamt", "", formatMaskedTime(relayResult.time)],
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
            {relayValidity.minOneMaleViolations > 0 && <Text size="xs">Mindestens ein Junge benötigt</Text>}
            {relayValidity.maxOneStartPerSwimmerViolations > 0 && (
              <Text size="xs">Maximal ein Start pro Schwimmer</Text>
            )}
          </Stack>
        )}
      </Box>
    );
  }

  function violationErrorText(violations: number | undefined, text: string) {
    if (violations !== undefined && violations > 0) {
      return <Text style={{ color: "var(--mantine-color-error)" }}>{text}</Text>;
    } else {
      return undefined;
    }
  }

  function renderTeamResult(result: Result, teamResult: TeamResult, teamIndex: number) {
    const swimmerCounts = new Map<number, number>();
    teamResult.relays.forEach((relayResult) => {
      relayResult.legs.forEach((legResult) => {
        if (!swimmerCounts.has(legResult.swimmer.id)) {
          swimmerCounts.set(legResult.swimmer.id, 0);
        }
        swimmerCounts.set(legResult.swimmer.id, swimmerCounts.get(legResult.swimmer.id)! + 1);
      });
    });
    return (
      <Box key={teamIndex}>
        <h3>Team {teamIndex + 1}</h3>
        <Text>Gesamtzeit: {formatMaskedTime(teamResult.time)}</Text>
        <Box>
          {violationErrorText(
            result?.validity?.teamValidities[teamIndex]?.minSwimmerViolations,
            "Min Schwimmer nicht eingehalten",
          )}
          {violationErrorText(
            result?.validity?.teamValidities[teamIndex]?.maxSwimmerViolations,
            "Max Schwimmer nicht eingehalten",
          )}
          {violationErrorText(
            result?.validity?.teamValidities[teamIndex]?.minMaleViolations,
            "Min Jungen pro Team nicht eingehalten",
          )}
          {violationErrorText(
            result?.validity?.teamValidities[teamIndex]?.minFemaleViolations,
            "Min Mädchen pro Team nicht eingehalten",
          )}
        </Box>
        <SimpleGrid cols={3} spacing="xl" verticalSpacing="xs">
          {teamResult.relays.map((relay, relayIndex) => renderRelayResult(result, relay, relayIndex, teamIndex))}
          <Box>
            <h4>Schwimmer</h4>
            <Table
              withTableBorder
              withRowBorders={false}
              data={{
                body: Array.from(swimmerCounts.entries(), ([swimmerId, count]) => [
                  swimmers.get(swimmerId)!.name,
                  `${count}x`,
                ]).sort(),
              }}
            />
          </Box>
        </SimpleGrid>
      </Box>
    );
  }

  function renderResult(result: Result) {
    return <Stack>{result.teams.map((team, index) => renderTeamResult(result, team, index))}</Stack>;
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
                    head: ["Geprüfte Kombinationen", "Dauer", "Rate"],
                    body: [
                      [
                        formatPerformanceMetrics(progress).checked,
                        formatPerformanceMetrics(progress).duration,
                        formatPerformanceMetrics(progress).rate,
                      ],
                    ],
                  }}
                />

                <LineChart
                  h={300}
                  data={calcDataFromProgress(progress)}
                  dataKey="generation"
                  series={progress.history.map((_, i) => ({
                    name: `score_${i}`,
                    color: colorScale(i / progress.history.length).hex(),
                  }))}
                  curveType="linear"
                  withDots={false}
                />

                <Table
                  data={{
                    head: ["Hash", "Score"],
                    body: sortBy(
                      uniqBy(
                        progress.history.flatMap((entries) => entries),
                        "hash",
                      ),
                      ["score", "state"],
                    )
                      .slice(0, 500)
                      .map((entry) => [entry.hash, entry.score]),
                  }}
                  style={{ textWrap: "nowrap" }}
                />
              </>
            )}
          </Stack>
        </Paper>

        <Box style={{ position: "relative" }}>
          <Paper withBorder shadow="md" p="xl">
            <Accordion value={accordionValue} onChange={setAccordionValue}>
              {results.map((result) => (
                <Accordion.Item key={String(result.generated)} value={String(result.generated)}>
                  <Accordion.Control
                    icon={result.validity.valid ? <IconCheck size={24} color="green" /> : <IconX color="red" />}
                  >
                    Gesamtzeit: {formatMaskedTime(result.time)}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Box>
                      {violationErrorText(
                        result?.validity?.minStartsPerSwimmerViolations,
                        "Min Starts pro Schwimmer nicht eingehalten",
                      )}
                      {violationErrorText(
                        result?.validity?.maxStartsPerSwimmerViolations,
                        "Max Starts pro Schwimmer nicht eingehalten",
                      )}
                      {violationErrorText(
                        result?.validity?.allMustSwimViolations,
                        "Alle müssen schwimmen nicht eingehalten",
                      )}
                      {violationErrorText(
                        result?.validity?.swimmerInMultipleTeamsViolations,
                        "Es gibt Schwimmer, die in mehreren Teams schwimmen",
                      )}
                      {violationErrorText(
                        result?.validity?.zeitspannePenaltySeconds,
                        "Maximale Staffelzeitendifferenz nicht eingehalten",
                      )}
                    </Box>

                    <Stack>{renderResult(result)}</Stack>

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
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
