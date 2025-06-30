import { HighPerfRelayConfiguration } from "../../eingabe/configuration.ts";
import { RelayState } from "../state/state";
import { Gender } from "../../eingabe/gender.ts";
import { penaltySecondsPerViolation } from "./common";

export interface RelayValidity {
  valid: boolean;
  errors: RelayError[];
}

export enum RelayError {
  MAX_ONE_START_PER_SWIMMER = "max-one-start-per-swimmer",
  MIN_ONE_MALE = "min-one-male",
  MIN_ONE_FEMALE = "min-one-female",
}

export function relayTime(
  relayState: RelayState,
  relayConfiguration: HighPerfRelayConfiguration,
  disciplineToSwimmerToTime: (number | undefined)[][],
): number {
  let time = 0;
  for (let legIndex = 0; legIndex < relayState.swimmerIndices.length; legIndex++) {
    const swimmerIndex = relayState.swimmerIndices[legIndex];
    const disciplineIndex: number = relayConfiguration.disciplineIndices[legIndex];
    const swimmerTime = getSwimmerTime(disciplineToSwimmerToTime, disciplineIndex, swimmerIndex);
    time = relayConfiguration.team ? Math.max(time, swimmerTime) : time + swimmerTime;
  }

  return time;
}

function calcMaxOneStartPerSwimmerViolations(relayState: RelayState, numSwimmers: number): number {
  const swimmerStarts = new Int8Array(numSwimmers);
  for (const swimmerIndex of relayState.swimmerIndices) {
    swimmerStarts[swimmerIndex]++;
  }

  let violations = 0;
  for (const numStarts of swimmerStarts) {
    const extraStartsForThisSwimmer = Math.max(numStarts - 1, 0);
    violations += extraStartsForThisSwimmer;
  }

  return violations;
}

function calcMinOneMaleViolations(relayState: RelayState, genders: Gender[]): number {
  let males = 0;
  for (const swimmerIndex of relayState.swimmerIndices) {
    if (genders[swimmerIndex] == Gender.MALE) {
      males++;
    }
  }
  return Math.max(1 - males, 0);
}

function calcMinOneFemaleViolations(relayState: RelayState, genders: Gender[]): number {
  let females = 0;
  for (const swimmerIndex of relayState.swimmerIndices) {
    if (genders[swimmerIndex] == Gender.FEMALE) {
      females++;
    }
  }
  return Math.max(1 - females, 0);
}

export function relayScore(
  relayState: RelayState,
  relayConfiguration: HighPerfRelayConfiguration,
  disciplineToSwimmerToTime: (number | undefined)[][],
  numSwimmers: number,
  genders: Gender[],
): number {
  return (
    relayTime(relayState, relayConfiguration, disciplineToSwimmerToTime) +
    penaltySecondsPerViolation * calcMaxOneStartPerSwimmerViolations(relayState, numSwimmers) +
    penaltySecondsPerViolation * calcMinOneMaleViolations(relayState, genders) +
    penaltySecondsPerViolation * calcMinOneFemaleViolations(relayState, genders)
  );
}

export function validateRelay(relayState: RelayState, numSwimmers: number, genders: Gender[]): RelayValidity {
  const maxOneStartPerSwimmerViolations = calcMaxOneStartPerSwimmerViolations(relayState, numSwimmers);
  const minOneMaleViolations = calcMinOneMaleViolations(relayState, genders);
  const minOneFemaleViolations = calcMinOneFemaleViolations(relayState, genders);

  const errors = [
    maxOneStartPerSwimmerViolations > 0 && RelayError.MAX_ONE_START_PER_SWIMMER,
    minOneFemaleViolations > 0 && RelayError.MIN_ONE_FEMALE,
    minOneMaleViolations > 0 && RelayError.MIN_ONE_MALE,
  ].filter(Boolean) as RelayError[];

  return { valid: errors.length === 0, errors };
}

function getSwimmerTime(
  disciplineToSwimmerToTime: (number | undefined)[][],
  disciplineIndex: number,
  swimmerIndex: number,
): number {
  const zeit = disciplineToSwimmerToTime[disciplineIndex][swimmerIndex];
  if (zeit === undefined) {
    throw Error("Programmierfehler");
  }
  return zeit;
}
