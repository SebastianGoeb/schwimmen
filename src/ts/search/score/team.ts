import { Konfiguration } from "../../eingabe/konfiguration";
import { Team } from "../state/state";
import { Geschlecht } from "../../eingabe/geschlecht";
import { staffelScore } from "./staffel";
import { strafSekundenProRegelverstoss } from "./common";

function countSchwimmer(team: Team, konfiguration: Konfiguration) {
  const present = new Int8Array(konfiguration.schwimmerList.length);
  for (const staffelBelegung of team.staffelBelegungen) {
    for (const schwimmerId of staffelBelegung.startBelegungen) {
      present[schwimmerId] = 1;
    }
  }

  let sum = 0;
  for (const isPresent of present) {
    sum += isPresent;
  }
  return sum;
}

function countGeschlechter(team: Team, konfiguration: Konfiguration): { males: number; females: number } {
  const male = 1;
  const female = 2;

  const geschlechter = new Int8Array(konfiguration.schwimmerList.length);
  for (const staffelBelegung of team.staffelBelegungen) {
    for (const schwimmerId of staffelBelegung.startBelegungen) {
      if (konfiguration.geschlecht[schwimmerId] == Geschlecht.MALE) {
        geschlechter[schwimmerId] = male;
      } else {
        geschlechter[schwimmerId] = female;
      }
    }
  }

  let males = 0;
  for (const g of geschlechter) {
    if (g == male) {
      males++;
    }
  }

  let females = 0;
  for (const g of geschlechter) {
    if (g == female) {
      females++;
    }
  }
  return { males, females };
}

export function teamScore(team: Team, konfiguration: Konfiguration): number {
  let staffelnScore = 0;
  for (const staffelBelegung of team.staffelBelegungen) {
    staffelnScore += staffelScore(staffelBelegung, konfiguration);
  }

  const anzahlSchwimmer = countSchwimmer(team, konfiguration);
  const minSchwimmerViolations = Math.max(konfiguration.minSchwimmerProTeam - anzahlSchwimmer, 0);
  const maxSchwimmerViolations = Math.max(anzahlSchwimmer - konfiguration.minSchwimmerProTeam, 0);
  const { males, females } = countGeschlechter(team, konfiguration);
  const minMaleViolations = Math.max(konfiguration.minMaleProTeam - males, 0);
  const minFemaleViolations = Math.max(konfiguration.minFemaleProTeam - females, 0);

  return (
    staffelnScore +
    strafSekundenProRegelverstoss * minSchwimmerViolations +
    strafSekundenProRegelverstoss * maxSchwimmerViolations +
    strafSekundenProRegelverstoss * minMaleViolations +
    strafSekundenProRegelverstoss * minFemaleViolations
  );
}
