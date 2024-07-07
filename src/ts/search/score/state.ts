import { Konfiguration } from "../../eingabe/konfiguration";
import { State } from "../state/state";
import { teamScore } from "./team";
import { strafSekundenProRegelverstoss } from "./common";
import { staffelGesamtzeit } from "./staffel";

function calculateStartsProSchwimmer(state: State, konfiguration: Konfiguration): Int8Array {
  const starts = new Int8Array(konfiguration.schwimmerList.length);
  for (const team of state.teams) {
    for (const staffelBelegung of team.staffelBelegungen) {
      for (const schwimmerId of staffelBelegung.startBelegungen) {
        starts[schwimmerId]++;
      }
    }
  }
  return starts;
}

function calculateMinStartsProSchwimmerViolations(startsProSchwimmer: Int8Array, konfiguration: Konfiguration): number {
  let violations = 0;
  for (let schimmerId = 0; schimmerId < startsProSchwimmer.length; schimmerId++) {
    const starts = startsProSchwimmer[schimmerId];
    violations += Math.max(konfiguration.minStartsProSchwimmer[schimmerId] - starts, 0);
  }
  return violations;
}

function calculateMaxStartsProSchwimmerViolations(startsProSchwimmer: Int8Array, konfiguration: Konfiguration): number {
  let violations = 0;
  for (let schimmerId = 0; schimmerId < startsProSchwimmer.length; schimmerId++) {
    const starts = startsProSchwimmer[schimmerId];
    violations += Math.max(starts - konfiguration.maxStartsProSchwimmer[schimmerId], 0);
  }
  return violations;
}

function calculateAlleMuessenSchwimmenViolations(startsProSchwimmer: Int8Array, konfiguration: Konfiguration): number {
  if (!konfiguration.alleMuessenSchwimmen) {
    return 0;
  }

  let violations = 0;
  for (let schimmerId = 0; schimmerId < startsProSchwimmer.length; schimmerId++) {
    const starts = startsProSchwimmer[schimmerId];
    if (starts == 0) {
      violations++;
    }
  }
  return violations;
}

function calculateSchwimmerInMehrerenTeamsViolations(state: State, konfiguration: Konfiguration): number {
  const hasMultipleTeams = new Int8Array(konfiguration.schwimmerList.length);
  const primaryTeamNumber = new Int8Array(konfiguration.schwimmerList.length);
  for (let i = 0; i < primaryTeamNumber.length; i++) {
    primaryTeamNumber[i] = -1;
  }

  for (let teamId = 0; teamId < state.teams.length; teamId++) {
    const team = state.teams[teamId];
    for (const staffelBelegung of team.staffelBelegungen) {
      for (const schwimmerId of staffelBelegung.startBelegungen) {
        if (hasMultipleTeams[schwimmerId] == 0) {
          if (primaryTeamNumber[schwimmerId] == -1) {
            primaryTeamNumber[schwimmerId] = teamId;
          } else {
            hasMultipleTeams[schwimmerId] = 1;
          }
        }
      }
    }
  }

  let sum = 0;
  for (const hasMultiple of hasMultipleTeams) {
    if (hasMultiple == 1) {
      sum++;
    }
  }

  return sum;
}

function calculateZeitspannePenaltySeconds(state: State, konfiguration: Konfiguration): number {
  if (konfiguration.anzahlTeams <= 1) {
    return 0;
  }

  let penalty = 0;
  for (let staffelId = 0; staffelId < konfiguration.staffeln.length; staffelId++) {
    let max = 0;
    let min = 0;
    for (const team of state.teams) {
      // TODO gesamtZeit not memoized due to lack of lazy {}
      const zeit = staffelGesamtzeit(team.staffelBelegungen[staffelId], konfiguration);
      max = Math.max(zeit, max);
      min = Math.min(zeit, min);
    }
    const spanne = max - min;
    if (spanne > konfiguration.maxZeitspanneProStaffelSeconds) {
      penalty += spanne + strafSekundenProRegelverstoss;
    }
  }

  return penalty;
}

export function stateScore(state: State, konfiguration: Konfiguration): number {
  let teamsScore = 0;
  for (const team of state.teams) {
    teamsScore += teamScore(team, konfiguration);
  }

  const startsProSchwimmer = calculateStartsProSchwimmer(state, konfiguration);
  const minStartsProSchwimmerViolations = calculateMinStartsProSchwimmerViolations(startsProSchwimmer, konfiguration);
  const maxStartsProSchwimmerViolations = calculateMaxStartsProSchwimmerViolations(startsProSchwimmer, konfiguration);
  const alleMuessenSchwimmenViolations = calculateAlleMuessenSchwimmenViolations(startsProSchwimmer, konfiguration);
  const schwimmerInMehrerenTeamsViolations = calculateSchwimmerInMehrerenTeamsViolations(state, konfiguration);

  return (
    teamsScore +
    strafSekundenProRegelverstoss * minStartsProSchwimmerViolations +
    strafSekundenProRegelverstoss * maxStartsProSchwimmerViolations +
    strafSekundenProRegelverstoss * alleMuessenSchwimmenViolations +
    strafSekundenProRegelverstoss * schwimmerInMehrerenTeamsViolations +
    calculateZeitspannePenaltySeconds(state, konfiguration)
  );
}
