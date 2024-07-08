import { StaffelBelegung, State, StateAndScore, Team } from "../state/state";
import { Konfiguration } from "../../eingabe/konfiguration";
import { stateScore } from "../score/state";

export function mutateRandom(state: State, konfiguration: Konfiguration): { state: StateAndScore; checked: number } {
  const teamIndex = randomIndex(state.teams);
  const team = state.teams[teamIndex];

  const staffelIndex = randomIndex(team.staffelBelegungen);
  const staffelBelegung = team.staffelBelegungen[staffelIndex];

  const startIndex = randomIndex(staffelBelegung.startBelegungen);
  const schwimmerId = staffelBelegung.startBelegungen[startIndex];
  const disziplinId = konfiguration.staffeln[staffelIndex].disziplinIds[startIndex];

  const schwimmerZeiten = konfiguration.disziplinToSchwimmerZeiten[disziplinId];

  const candidates = schwimmerZeiten.filter((it) => it.schwimmerId != schwimmerId);
  const neueSchwimmerId = candidates[randomIndex(candidates)].schwimmerId;

  const result = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId);
  return {
    state: {
      state: result,
      score: stateScore(state, konfiguration),
    },
    checked: 1,
  };
}

export function mutateVerySmart(state: State, konfiguration: Konfiguration): { state: StateAndScore; checked: number } {
  let best: StateAndScore | undefined = undefined;
  let checked = 0;

  for (let teamIndex = 0; teamIndex < state.teams.length; teamIndex++) {
    const team = state.teams[teamIndex];

    for (let staffelIndex = 0; staffelIndex < team.staffelBelegungen.length; staffelIndex++) {
      const staffelBelegung = team.staffelBelegungen[staffelIndex];

      for (let startIndex = 0; startIndex < staffelBelegung.startBelegungen.length; startIndex++) {
        const schwimmerId = staffelBelegung.startBelegungen[startIndex];
        const disziplinId = konfiguration.staffeln[staffelIndex].disziplinIds[startIndex];

        for (const schwimmerIdZeit of konfiguration.disziplinToSchwimmerZeiten[disziplinId]) {
          if (schwimmerIdZeit.schwimmerId != schwimmerId) {
            const candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, schwimmerIdZeit.schwimmerId);
            const score = stateScore(candidate, konfiguration);
            if (best === undefined || score < best.score) {
              best = { state: candidate, score };
            }
            checked++;
          }
        }
      }
    }
  }
  return {
    state: best!,
    checked: 1,
  };
}

function replaceSchwimmer(
  state: State,
  teamIndex: number,
  staffelIndex: number,
  startIndex: number,
  neueSchwimmerId: number,
): State {
  const team = state.teams[teamIndex];
  const staffelBelegung = team.staffelBelegungen[staffelIndex];

  const neueStartBelegungen: number[] = replace(staffelBelegung.startBelegungen, startIndex, neueSchwimmerId);
  const neueStaffelBelegungen: StaffelBelegung[] = replace(team.staffelBelegungen, staffelIndex, {
    ...staffelBelegung,
    startBelegungen: neueStartBelegungen,
  });
  const neueTeams: Team[] = replace(state.teams, teamIndex, {
    ...team,
    staffelBelegungen: neueStaffelBelegungen,
  });

  return { teams: neueTeams };
}

function randomIndex(array: any[]): number {
  return Math.floor(Math.random() * array.length);
}

function replace<T>(array: T[], index: number, value: T): T[] {
  const copy = array.slice();
  copy[index] = value;
  return copy;
}
