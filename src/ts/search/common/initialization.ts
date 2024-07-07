import { StaffelBelegung, State, Team } from "../state/state";
import { Konfiguration, StaffelX } from "../../eingabe/konfiguration";

export function initialRandomAssignment(konfiguration: Konfiguration): State {
  return { teams: Array(konfiguration.anzahlTeams).filter(() => generateTeam(konfiguration)) };
}

function generateTeam(konfiguration: Konfiguration): Team {
  return {
    staffelBelegungen: konfiguration.staffeln.map((staffel, staffelId) =>
      generateStaffelBelegung(staffel, staffelId, konfiguration),
    ),
  };
}

function generateStaffelBelegung(staffel: StaffelX, staffelId: number, konfiguration: Konfiguration): StaffelBelegung {
  return {
    staffelId,
    startBelegungen: staffel.disziplinIds.map((diszplinId) => generateStartBelegung(diszplinId, konfiguration)),
  };
}

function generateStartBelegung(disziplinId: number, konfiguration: Konfiguration): number {
  const schwimmerIdsZuDenenEsZeitenGibt = konfiguration.disziplinToSchwimmerZeiten[disziplinId];
  const index = Math.random() * schwimmerIdsZuDenenEsZeitenGibt.length;
  return schwimmerIdsZuDenenEsZeitenGibt[index].schwimmerId;
}
