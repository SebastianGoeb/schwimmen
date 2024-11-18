import { getSwimmerTime, HighPerfConfiguration } from "../../eingabe/configuration.ts";
import { RelayState } from "../state/state";
import { Gender } from "../../eingabe/gender.ts";
import { penaltySecondsPerViolation } from "./common";

export function relayTime(relayState: RelayState, relayIndex: number, configuration: HighPerfConfiguration): number {
  const relay = configuration.relays[relayIndex];
  let time = 0;
  for (let legIndex = 0; legIndex < relayState.swimmerIndices.length; legIndex++) {
    const swimmerIndex = relayState.swimmerIndices[legIndex];
    const disciplineIndex: number = relay.disciplineIndices[legIndex];
    const swimmerTime = getSwimmerTime(configuration, disciplineIndex, swimmerIndex);
    time = relay.team ? Math.max(time, swimmerTime) : time + swimmerTime;
  }

  return time;
}

function calcMaxOneStartPerSwimmerViolations(relayState: RelayState, configuration: HighPerfConfiguration): number {
  const swimmerStarts = new Int8Array(configuration.numSwimmers);
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

function calcMinOneMaleViolations(relayState: RelayState, configuration: HighPerfConfiguration): number {
  let males = 0;
  for (const swimmerIndex of relayState.swimmerIndices) {
    if (configuration.genders[swimmerIndex] == Gender.MALE) {
      males++;
    }
  }
  return Math.max(1 - males, 0);
}

function calcMinOneFemaleViolations(relayState: RelayState, configuration: HighPerfConfiguration): number {
  let females = 0;
  for (const swimmerIndex of relayState.swimmerIndices) {
    if (configuration.genders[swimmerIndex] == Gender.FEMALE) {
      females++;
    }
  }
  return Math.max(1 - females, 0);
}

export function relayScore(relayState: RelayState, relayIndex: number, configuration: HighPerfConfiguration): number {
  return (
    relayTime(relayState, relayIndex, configuration) +
    penaltySecondsPerViolation * calcMaxOneStartPerSwimmerViolations(relayState, configuration) +
    penaltySecondsPerViolation * calcMinOneMaleViolations(relayState, configuration) +
    penaltySecondsPerViolation * calcMinOneFemaleViolations(relayState, configuration)
  );
}

export interface RelayValidity {
  valid: boolean;
  maxOneStartPerSwimmerViolations: number;
  minOneMaleViolations: number;
  minOneFemaleViolations: number;
}

export function validateRelay(relayState: RelayState, configuration: HighPerfConfiguration): RelayValidity {
  const maxOneStartPerSwimmerViolations = calcMaxOneStartPerSwimmerViolations(relayState, configuration);
  const minOneMaleViolations = calcMinOneMaleViolations(relayState, configuration);
  const minOneFemaleViolations = calcMinOneFemaleViolations(relayState, configuration);
  return {
    valid: maxOneStartPerSwimmerViolations === 0 && minOneMaleViolations === 0 && minOneFemaleViolations === 0,
    maxOneStartPerSwimmerViolations: maxOneStartPerSwimmerViolations,
    minOneMaleViolations,
    minOneFemaleViolations,
  };
}
