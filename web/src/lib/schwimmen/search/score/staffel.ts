import { getZeit, Konfiguration } from "../../eingabe/konfiguration";
import { StaffelBelegung } from "../state/state";
import { Geschlecht } from "../../eingabe/geschlecht";
import { strafSekundenProRegelverstoss } from "./common";

export function staffelGesamtzeit(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): number {
  const staffel = konfiguration.staffeln[staffelBelegung.staffelId];
  const startBelegungen = staffelBelegung.startBelegungen;

  let gesamtZeit = 0;
  for (let startId = 0; startId < startBelegungen.length; startId++) {
    const schwimmerId = startBelegungen[startId];
    const disziplinId: number = staffel.disziplinIds[startId];
    const zeit = getZeit(konfiguration, disziplinId, schwimmerId);
    gesamtZeit = staffel.team ? Math.max(gesamtZeit, zeit) : gesamtZeit + zeit;
  }

  return gesamtZeit;
}

function calcMaxOneStartProSchwimmerViolations(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): number {
  const starts = new Int8Array(konfiguration.schwimmerList.length);
  for (const schwimmerId of staffelBelegung.startBelegungen) {
    starts[schwimmerId]++;
  }

  let sum = 0;
  for (const numStarts of starts) {
    sum += Math.max(numStarts - 1, 0);
  }

  return sum;
}

function calcMinOneMaleViolations(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): number {
  let sum = 0;
  for (const schwimmerId of staffelBelegung.startBelegungen) {
    if (konfiguration.geschlecht[schwimmerId] == Geschlecht.MALE) {
      sum++;
    }
  }
  return Math.max(1 - sum, 0);
}

function calcMinOneFemaleViolations(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): number {
  let sum = 0;
  for (const schwimmerId of staffelBelegung.startBelegungen) {
    if (konfiguration.geschlecht[schwimmerId] == Geschlecht.FEMALE) {
      sum++;
    }
  }
  return Math.max(1 - sum, 0);
}

export function staffelScore(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): number {
  return (
    staffelGesamtzeit(staffelBelegung, konfiguration) +
    strafSekundenProRegelverstoss * calcMaxOneStartProSchwimmerViolations(staffelBelegung, konfiguration) +
    strafSekundenProRegelverstoss * calcMinOneMaleViolations(staffelBelegung, konfiguration) +
    strafSekundenProRegelverstoss * calcMinOneFemaleViolations(staffelBelegung, konfiguration)
  );
}

export interface StaffelValidity {
  valid: boolean;
  maxOneStartProSchwimmerViolations: number;
  minOneMaleViolations: number;
  minOneFemaleViolations: number;
}

export function validateStaffel(staffelBelegung: StaffelBelegung, konfiguration: Konfiguration): StaffelValidity {
  const maxOneStartProSchwimmerViolations = calcMaxOneStartProSchwimmerViolations(staffelBelegung, konfiguration);
  const minOneMaleViolations = calcMinOneMaleViolations(staffelBelegung, konfiguration);
  const minOneFemaleViolations = calcMinOneFemaleViolations(staffelBelegung, konfiguration);
  return {
    valid: maxOneStartProSchwimmerViolations === 0 && minOneMaleViolations === 0 && minOneFemaleViolations === 0,
    maxOneStartProSchwimmerViolations,
    minOneMaleViolations,
    minOneFemaleViolations,
  };
}
