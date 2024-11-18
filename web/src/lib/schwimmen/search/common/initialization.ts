import { RelayState, State, TeamState } from "../state/state";
import { HighPerfConfiguration, HighPerfRelay } from "../../eingabe/configuration.ts";
import { times } from "lodash-es";

export function generateRandomState(configuration: HighPerfConfiguration): State {
  return { teams: times(configuration.numTeams, () => generateRandomTeamState(configuration)) };
}

function generateRandomTeamState(configuration: HighPerfConfiguration): TeamState {
  return {
    relays: configuration.relays.map((relay) => generateRandomRelayState(relay, configuration)),
  };
}

function generateRandomRelayState(relay: HighPerfRelay, configuration: HighPerfConfiguration): RelayState {
  return {
    swimmerIndices: relay.disciplineIndices.map((disciplineIndex) =>
      generateRandomSwimmerIndex(disciplineIndex, configuration),
    ),
  };
}

function generateRandomSwimmerIndex(disciplineIndex: number, configuration: HighPerfConfiguration): number {
  const swimmersWithLapTimes = configuration.disciplineToSwimmerTimes[disciplineIndex];
  const choice = Math.floor(Math.random() * swimmersWithLapTimes.length);
  return swimmersWithLapTimes[choice].swimmerIndex;
}
