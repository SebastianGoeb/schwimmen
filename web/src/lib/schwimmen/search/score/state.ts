import { HighPerfConfiguration } from "../../eingabe/configuration.ts";
import { State } from "../state/state";
import { teamScore, TeamValidity, teamValidity } from "./team";
import { penaltySecondsPerViolation } from "./common";
import { relayTime } from "./relay.ts";

function calculateStartsPerSwimmer(state: State, configuration: HighPerfConfiguration): Int8Array {
  const swimmerStarts = new Int8Array(configuration.numSwimmers);
  for (const teamState of state.teams) {
    for (const relayState of teamState.relays) {
      for (const swimmerIndex of relayState.swimmerIndices) {
        swimmerStarts[swimmerIndex]++;
      }
    }
  }
  return swimmerStarts;
}

function calculateMinStartsPerSwimmerViolations(
  startsPerSwimmer: Int8Array,
  configuration: HighPerfConfiguration,
): number {
  let violations = 0;
  for (let swimmerIndex = 0; swimmerIndex < startsPerSwimmer.length; swimmerIndex++) {
    const starts = startsPerSwimmer[swimmerIndex];
    violations += Math.max(configuration.minStartsPerSwimmer[swimmerIndex] - starts, 0);
  }
  return violations;
}

function calculateMaxStartsPerSwimmerViolations(
  startsPerSwimmer: Int8Array,
  configuration: HighPerfConfiguration,
): number {
  let violations = 0;
  for (let schimmerIndex = 0; schimmerIndex < startsPerSwimmer.length; schimmerIndex++) {
    const starts = startsPerSwimmer[schimmerIndex];
    violations += Math.max(starts - configuration.maxStartsPerSwimmer[schimmerIndex], 0);
  }
  return violations;
}

function calculateAllMustSwimViolations(startsPerSwimmer: Int8Array, configuration: HighPerfConfiguration): number {
  if (!configuration.allMustSwim) {
    return 0;
  }

  let violations = 0;
  for (let schimmerIndex = 0; schimmerIndex < startsPerSwimmer.length; schimmerIndex++) {
    const starts = startsPerSwimmer[schimmerIndex];
    if (starts == 0) {
      violations++;
    }
  }
  return violations;
}

function calculateSwimmerInMultipleTeamsViolations(state: State, configuration: HighPerfConfiguration): number {
  const hasMultipleTeams = new Int8Array(configuration.numSwimmers);
  const primaryTeamNumber = new Int8Array(configuration.numSwimmers);
  for (let i = 0; i < primaryTeamNumber.length; i++) {
    primaryTeamNumber[i] = -1;
  }

  for (let teamIndex = 0; teamIndex < state.teams.length; teamIndex++) {
    const teamState = state.teams[teamIndex];
    for (const relayState of teamState.relays) {
      for (const swimmerIndex of relayState.swimmerIndices) {
        if (hasMultipleTeams[swimmerIndex] == 0) {
          if (primaryTeamNumber[swimmerIndex] == -1) {
            primaryTeamNumber[swimmerIndex] = teamIndex;
          } else if (primaryTeamNumber[swimmerIndex] != teamIndex) {
            hasMultipleTeams[swimmerIndex] = 1;
          }
        }
      }
    }
  }

  let violations = 0;
  for (const hasMultiple of hasMultipleTeams) {
    if (hasMultiple == 1) {
      violations++;
    }
  }

  return violations;
}

function calculateRelayTimeDifferencePenaltySeconds(state: State, configuration: HighPerfConfiguration): number {
  if (configuration.numTeams <= 1) {
    return 0;
  }

  let penalty = 0;
  for (let relayIndex = 0; relayIndex < configuration.relays.length; relayIndex++) {
    let max = 0;
    let min = 9999999;
    for (const teamState of state.teams) {
      const relayConfiguration = configuration.relays[relayIndex];
      const time = relayTime(teamState.relays[relayIndex], relayConfiguration, configuration.disciplineToSwimmerToTime);
      max = Math.max(time, max);
      min = Math.min(time, min);
    }
    const timeDifference = max - min;
    if (timeDifference > configuration.maxTimeDifferencePerRelaySeconds) {
      penalty += timeDifference + penaltySecondsPerViolation;
    }
  }

  return penalty;
}

export function stateScore(state: State, configuration: HighPerfConfiguration): number {
  let teamsScore = 0;
  for (const teamState of state.teams) {
    teamsScore += teamScore(teamState, configuration);
  }

  const startsPerSwimmer = calculateStartsPerSwimmer(state, configuration);
  const minStartsPerSwimmerViolations = calculateMinStartsPerSwimmerViolations(startsPerSwimmer, configuration);
  const maxStartsPerSwimmerViolations = calculateMaxStartsPerSwimmerViolations(startsPerSwimmer, configuration);
  const allMustSwimViolations = calculateAllMustSwimViolations(startsPerSwimmer, configuration);
  const swimmerInMultipleTeamsViolations = calculateSwimmerInMultipleTeamsViolations(state, configuration);

  const zeitspannePenaltySeconds = calculateRelayTimeDifferencePenaltySeconds(state, configuration);
  const number =
    teamsScore +
    penaltySecondsPerViolation * minStartsPerSwimmerViolations +
    penaltySecondsPerViolation * maxStartsPerSwimmerViolations +
    penaltySecondsPerViolation * allMustSwimViolations +
    penaltySecondsPerViolation * swimmerInMultipleTeamsViolations +
    zeitspannePenaltySeconds;
  return number;
}

export interface StateValidity {
  valid: boolean;
  teamValidities: TeamValidity[];
  minStartsPerSwimmerViolations: number;
  maxStartsPerSwimmerViolations: number;
  allMustSwimViolations: number;
  swimmerInMultipleTeamsViolations: number;
  zeitspannePenaltySeconds: number;
}

export function stateValidity(state: State, configuration: HighPerfConfiguration): StateValidity {
  const teamValidities = state.teams.map((team) => teamValidity(team, configuration));

  const startsPerSwimmer = calculateStartsPerSwimmer(state, configuration);
  const minStartsPerSwimmerViolations = calculateMinStartsPerSwimmerViolations(startsPerSwimmer, configuration);
  const maxStartsPerSwimmerViolations = calculateMaxStartsPerSwimmerViolations(startsPerSwimmer, configuration);
  const allMustSwimViolations = calculateAllMustSwimViolations(startsPerSwimmer, configuration);
  const swimmerInMultipleTeamsViolations = calculateSwimmerInMultipleTeamsViolations(state, configuration);

  const zeitspannePenaltySeconds = calculateRelayTimeDifferencePenaltySeconds(state, configuration);
  return {
    valid:
      teamValidities.every((it) => it.valid) &&
      minStartsPerSwimmerViolations === 0 &&
      maxStartsPerSwimmerViolations === 0 &&
      allMustSwimViolations === 0 &&
      swimmerInMultipleTeamsViolations === 0 &&
      zeitspannePenaltySeconds === 0,
    teamValidities,
    minStartsPerSwimmerViolations,
    maxStartsPerSwimmerViolations,
    allMustSwimViolations: allMustSwimViolations,
    swimmerInMultipleTeamsViolations: swimmerInMultipleTeamsViolations,
    zeitspannePenaltySeconds,
  };
}
