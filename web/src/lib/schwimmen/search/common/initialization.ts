import { StaffelBelegung, State, Team } from "../state/state";
import { Konfiguration, StaffelX } from "../../eingabe/konfiguration";
import { times } from "lodash-es";

export function initialRandomAssignment(konfiguration: Konfiguration): State {
  return { teams: times(konfiguration.anzahlTeams, () => generateTeam(konfiguration)) };
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
  const index = Math.floor(Math.random() * schwimmerIdsZuDenenEsZeitenGibt.length);
  return schwimmerIdsZuDenenEsZeitenGibt[index].schwimmerId;
}
