import { RelayState, State, StateAndScore, TeamState } from "../state/state";
import { HighPerfConfiguration } from "../../eingabe/configuration.ts";
import { stateScore } from "../score/state";

export function mutateRandom(
  state: State,
  configuration: HighPerfConfiguration,
): { state: StateAndScore; checked: number } {
  const teamIndex = randomIndex(state.teams);
  const teamState = state.teams[teamIndex];

  const relayIndex = randomIndex(teamState.relays);
  const relayState = teamState.relays[relayIndex];

  const legIndex = randomIndex(relayState.swimmerIndices);
  const swimmerIndex = relayState.swimmerIndices[legIndex];
  const disciplineIndex = configuration.relays[relayIndex].disciplineIndices[legIndex];

  const swimmerIndicesAndTimes = configuration.disciplineToSwimmerTimes[disciplineIndex];

  const candidatesSwimmers = swimmerIndicesAndTimes.filter((it) => it.swimmerIndex != swimmerIndex);
  const newSwimmerIndex = candidatesSwimmers[randomIndex(candidatesSwimmers)].swimmerIndex;

  const newState = replaceSwimmer(state, teamIndex, relayIndex, legIndex, newSwimmerIndex);
  return {
    state: {
      state: newState,
      score: stateScore(state, configuration),
    },
    checked: 1,
  };
}

export function mutateVerySmart(
  state: State,
  configuration: HighPerfConfiguration,
): { state: StateAndScore; checked: number } {
  let best: StateAndScore | undefined = undefined;
  let checked = 0;

  for (let teamIndex = 0; teamIndex < state.teams.length; teamIndex++) {
    const teamState = state.teams[teamIndex];

    for (let relayIndex = 0; relayIndex < teamState.relays.length; relayIndex++) {
      const relayState = teamState.relays[relayIndex];

      for (let legIndex = 0; legIndex < relayState.swimmerIndices.length; legIndex++) {
        const swimmerIndex = relayState.swimmerIndices[legIndex];
        const disciplineIndex = configuration.relays[relayIndex].disciplineIndices[legIndex];

        for (const swimmerIndexAndTime of configuration.disciplineToSwimmerTimes[disciplineIndex]) {
          if (swimmerIndexAndTime.swimmerIndex != swimmerIndex) {
            const candidateState = replaceSwimmer(
              state,
              teamIndex,
              relayIndex,
              legIndex,
              swimmerIndexAndTime.swimmerIndex,
            );
            const candidateScore = stateScore(candidateState, configuration);
            if (best === undefined || candidateScore < best.score) {
              best = { state: candidateState, score: candidateScore };
            }
            checked++;
          }
        }
      }
    }
  }
  return {
    state: best!,
    checked,
  };
}

function replaceSwimmer(
  state: State,
  teamIndex: number,
  relayIndex: number,
  legIndex: number,
  newSwimmerIndex: number,
): State {
  const teamState = state.teams[teamIndex];
  const relayState = teamState.relays[relayIndex];

  const newSwimmerIndices: number[] = replace(relayState.swimmerIndices, legIndex, newSwimmerIndex);
  const newRelayStates: RelayState[] = replace(teamState.relays, relayIndex, {
    ...relayState,
    swimmerIndices: newSwimmerIndices,
  });
  const newTeamStates: TeamState[] = replace(state.teams, teamIndex, {
    ...teamState,
    relays: newRelayStates,
  });

  return { teams: newTeamStates };
}

function randomIndex(array: unknown[]): number {
  return Math.floor(Math.random() * array.length);
}

function replace<T>(array: T[], index: number, value: T): T[] {
  const copy = array.slice();
  copy[index] = value;
  return copy;
}
