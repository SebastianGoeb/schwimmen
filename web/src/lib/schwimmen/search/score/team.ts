import { HighPerfConfiguration } from "../../eingabe/configuration.ts";
import { TeamState } from "../state/state";
import { Gender } from "../../eingabe/gender.ts";
import { relayScore, RelayValidity, validateRelay } from "./relay.ts";
import { penaltySecondsPerViolation } from "./common";

function countSwimmers(teamState: TeamState, configuration: HighPerfConfiguration) {
  const swimmerPresent = new Int8Array(configuration.numSwimmers);
  for (const relayState of teamState.relays) {
    for (const swimmerIndex of relayState.swimmerIndices) {
      swimmerPresent[swimmerIndex] = 1;
    }
  }

  let numSwimmers = 0;
  for (const isPresent of swimmerPresent) {
    numSwimmers += isPresent;
  }
  return numSwimmers;
}

function countGenders(teamState: TeamState, configuration: HighPerfConfiguration): { males: number; females: number } {
  const male = 1;
  const female = 2;

  const swimmerGenders = new Int8Array(configuration.numSwimmers);
  for (const relayState of teamState.relays) {
    for (const swimmerIndex of relayState.swimmerIndices) {
      if (configuration.genders[swimmerIndex] == Gender.MALE) {
        swimmerGenders[swimmerIndex] = male;
      } else {
        swimmerGenders[swimmerIndex] = female;
      }
    }
  }

  let males = 0;
  for (const g of swimmerGenders) {
    if (g == male) {
      males++;
    }
  }

  let females = 0;
  for (const g of swimmerGenders) {
    if (g == female) {
      females++;
    }
  }
  return { males, females };
}

export function teamScore(teamState: TeamState, configuration: HighPerfConfiguration): number {
  let relaysScore = 0;
  for (let relayIndex = 0; relayIndex < teamState.relays.length; relayIndex++) {
    relaysScore += relayScore(
      teamState.relays[relayIndex],
      configuration.relays[relayIndex],
      configuration.disciplineToSwimmerToTime,
      configuration.numSwimmers,
      configuration.genders,
    );
  }

  const numSwimmers = countSwimmers(teamState, configuration);
  const minSwimmerViolations = Math.max(configuration.minSwimmersPerTeam - numSwimmers, 0);
  const maxSwimmerViolations = Math.max(numSwimmers - configuration.maxSwimmersPerTeam, 0);
  const { males, females } = countGenders(teamState, configuration);
  const minMaleViolations = Math.max(configuration.minMalesPerTeam - males, 0);
  const minFemaleViolations = Math.max(configuration.minFemalesPerTeam - females, 0);

  return (
    relaysScore +
    penaltySecondsPerViolation * minSwimmerViolations +
    penaltySecondsPerViolation * maxSwimmerViolations +
    penaltySecondsPerViolation * minMaleViolations +
    penaltySecondsPerViolation * minFemaleViolations
  );
}

export interface TeamValidity {
  valid: boolean;
  relayValidities: RelayValidity[];
  minSwimmerViolations: number;
  maxSwimmerViolations: number;
  minMaleViolations: number;
  minFemaleViolations: number;
}

export function teamValidity(teamState: TeamState, configuration: HighPerfConfiguration): TeamValidity {
  const relayValidities = teamState.relays.map((relayState) => validateRelay(relayState, configuration));

  const numSwimmers = countSwimmers(teamState, configuration);
  const minSwimmerViolations = Math.max(configuration.minSwimmersPerTeam - numSwimmers, 0);
  const maxSwimmerViolations = Math.max(numSwimmers - configuration.maxSwimmersPerTeam, 0);
  const { males, females } = countGenders(teamState, configuration);
  const minMaleViolations = Math.max(configuration.minMalesPerTeam - males, 0);
  const minFemaleViolations = Math.max(configuration.minFemalesPerTeam - females, 0);

  return {
    valid:
      relayValidities.every((it) => it.valid) &&
      minSwimmerViolations === 0 &&
      maxSwimmerViolations === 0 &&
      minMaleViolations === 0 &&
      minFemaleViolations === 0,
    relayValidities: relayValidities,
    minSwimmerViolations: minSwimmerViolations,
    maxSwimmerViolations: maxSwimmerViolations,
    minMaleViolations,
    minFemaleViolations,
  };
}
