import { MinMax } from "./minmax";
import { Schwimmer } from "./zeiten";
import { Geschlecht } from "./geschlecht";
import { Staffel } from "./staffeln";

export interface StaffelX {
  name: string;
  disziplinIds: number[];
  disziplinNames: string[];
  team: boolean;
}

export interface Konfiguration {
  alleMuessenSchwimmen: boolean;
  minSchwimmerProTeam: number;
  maxSchwimmerProTeam: number;
  minMaleProTeam: number;
  minFemaleProTeam: number;
  anzahlTeams: number;
  maxZeitspanneProStaffelSeconds: number;
  minStartsProSchwimmer: Int8Array;
  maxStartsProSchwimmer: Int8Array;
  staffeln: StaffelX[];
  schwimmerList: Schwimmer[];
  geschlecht: Geschlecht[];
  disziplinToSchwimmerZeiten: { schwimmerId: number; zeit: number }[][];
  disziplinToSchwimmerToZeit: (number | undefined)[][];
}

export interface Parameters {
  alleMuessenSchwimmen: boolean;
  minSchwimmerProTeam: number;
  maxSchwimmerProTeam: number;
  minMaleProTeam: number;
  minFemaleProTeam: number;
  minStartsProSchwimmer: number;
  maxStartsProSchwimmer: number;
  anzahlTeams: number;
  maxZeitspanneProStaffelSeconds: number;
}

export interface KonfigurationBuilder {
  parameters: Parameters;
  minMax: Map<string, MinMax>;
  staffeln: Staffel[];
  schwimmerList: Schwimmer[];
  geschlecht: Map<string, Geschlecht>;
}

export function parseParametersFromGrid(data: string[][]): Parameters {
  // TODO error handling
  return {
    alleMuessenSchwimmen: jaNeinToBoolean(findValue("Alle müssen schwimmen", data)!),
    minSchwimmerProTeam: Number(findValue("Min Schwimmer pro Team", data)),
    maxSchwimmerProTeam: Number(findValue("Max Schwimmer pro Team", data)),
    minMaleProTeam: Number(findValue("Min Jungen pro Team", data)),
    minFemaleProTeam: Number(findValue("Min Mädchen pro Team", data)),
    minStartsProSchwimmer: Number(findValue("Min Starts pro Schwimmer", data)),
    maxStartsProSchwimmer: Number(findValue("Max Starts pro Schwimmer", data)),
    anzahlTeams: Number(findValue("Anzahl Teams", data)),
    maxZeitspanneProStaffelSeconds: Number(findValue("Max Zeitspanne pro Staffel", data)),
  };
}

function findValue(key: string, data: string[][]): string | undefined {
  const row = data.find((row) => row[0].toLowerCase() === key.toLowerCase());
  if (row === undefined) {
    return undefined;
  }
  return row[1];
}

function jaNeinToBoolean(data: string): boolean {
  return data.trim().toLowerCase() === "ja";
}

function buildDisziplinNameToId(disziplinen: string[]): Map<string, number> {
  const result = new Map<string, number>();
  for (let schimmerId = 0; schimmerId < disziplinen.length; schimmerId++) {
    result.set(disziplinen[schimmerId], schimmerId);
  }
  return result;
}

function buildDisziplinen(staffeln: Staffel[]): string[] {
  const result = new Set<string>();
  for (const staffel of staffeln) {
    for (const disziplin of staffel.disziplinen) {
      result.add(disziplin);
    }
  }
  return Array.from(result);
}

function buildMinStartsProSchwimmer(konfigurationBuilder: KonfigurationBuilder): Int8Array {
  const result = new Int8Array(konfigurationBuilder.schwimmerList.length);
  for (let schwimmerId = 0; schwimmerId < konfigurationBuilder.schwimmerList.length; schwimmerId++) {
    result[schwimmerId] =
      konfigurationBuilder.minMax.get(konfigurationBuilder.schwimmerList[schwimmerId].name)?.min ??
      konfigurationBuilder.parameters.minStartsProSchwimmer;
  }
  return result;
}

function buildMaxStartsProSchwimmer(konfigurationBuilder: KonfigurationBuilder): Int8Array {
  const result = new Int8Array(konfigurationBuilder.schwimmerList.length);
  for (let schwimmerId = 0; schwimmerId < konfigurationBuilder.schwimmerList.length; schwimmerId++) {
    result[schwimmerId] =
      konfigurationBuilder.minMax.get(konfigurationBuilder.schwimmerList[schwimmerId].name)?.max ??
      konfigurationBuilder.parameters.maxStartsProSchwimmer;
  }
  return result;
}

function buildGeschlecht(konfigurationBuilder: KonfigurationBuilder): Geschlecht[] {
  return konfigurationBuilder.schwimmerList.map((schwimmer) => {
    const geschlecht = konfigurationBuilder.geschlecht.get(schwimmer.name);
    if (geschlecht === undefined) {
      throw Error(`Geschlecht für Schwimmer ${schwimmer.name} wurde nicht gefunden`);
    }
    return geschlecht;
  });
}

function buildDisziplinToSchwimmerToZeit(
  disziplinen: string[],
  konfigurationBuilder: KonfigurationBuilder,
): (number | undefined)[][] {
  return disziplinen.map((disziplin) =>
    konfigurationBuilder.schwimmerList.map((schwimmer) => schwimmer.zeitenSeconds.get(disziplin)),
  );
}

function buildDisziplinToSchwimmerZeiten(
  disziplinen: string[],
  konfigurationBuilder: KonfigurationBuilder,
): { schwimmerId: number; zeit: number }[][] {
  return disziplinen.map((disziplin) =>
    konfigurationBuilder.schwimmerList
      .map((schwimmer, schwimmerId) => ({
        schwimmerId: schwimmerId,
        zeit: schwimmer.zeitenSeconds.get(disziplin),
      }))
      .filter(hasZeit),
  );
}

function hasZeit(argument: {
  schwimmerId: number;
  zeit: number | undefined;
}): argument is { schwimmerId: number; zeit: number } {
  return argument.zeit !== undefined;
}

function buildStaffelX(staffel: Staffel, disziplinNameToId: Map<string, number>): StaffelX {
  return {
    name: staffel.name,
    disziplinIds: staffel.disziplinen.map((disziplin) => disziplinNameToId.get(disziplin)!),
    disziplinNames: staffel.disziplinen,
    team: staffel.team,
  };
}

export function buildKonfiguration(konfigurationBuilder: KonfigurationBuilder): Konfiguration {
  const disziplinen = buildDisziplinen(konfigurationBuilder.staffeln);
  const disziplinNameToId = buildDisziplinNameToId(disziplinen);
  // const schwimmerNameToId = buildSchwimmerNameToId(konfigurationBuilder.schwimmerList);
  const minStartsProSchwimmer = buildMinStartsProSchwimmer(konfigurationBuilder);
  const maxStartsProSchwimmer = buildMaxStartsProSchwimmer(konfigurationBuilder);
  const geschlecht = buildGeschlecht(konfigurationBuilder);
  const disziplinToSchwimmerToZeit = buildDisziplinToSchwimmerToZeit(disziplinen, konfigurationBuilder);
  const staffeln = konfigurationBuilder.staffeln.map((staffel) => buildStaffelX(staffel, disziplinNameToId));
  const disziplinToSchwimmerZeiten = buildDisziplinToSchwimmerZeiten(disziplinen, konfigurationBuilder);

  return {
    alleMuessenSchwimmen: konfigurationBuilder.parameters.alleMuessenSchwimmen,
    minSchwimmerProTeam: konfigurationBuilder.parameters.minSchwimmerProTeam,
    maxSchwimmerProTeam: konfigurationBuilder.parameters.maxSchwimmerProTeam,
    minMaleProTeam: konfigurationBuilder.parameters.minMaleProTeam,
    minFemaleProTeam: konfigurationBuilder.parameters.minFemaleProTeam,
    minStartsProSchwimmer,
    maxStartsProSchwimmer,
    anzahlTeams: konfigurationBuilder.parameters.anzahlTeams,
    maxZeitspanneProStaffelSeconds: konfigurationBuilder.parameters.maxZeitspanneProStaffelSeconds,
    staffeln,
    schwimmerList: konfigurationBuilder.schwimmerList,
    geschlecht,
    disziplinToSchwimmerToZeit,
    disziplinToSchwimmerZeiten,
  };
}

export function getZeit(konfiguration: Konfiguration, disziplinId: number, schwimmerId: number): number {
  const zeit = konfiguration.disziplinToSchwimmerToZeit[disziplinId][schwimmerId];
  if (zeit === undefined) {
    throw Error("Programmierfehler");
  }
  return zeit;
}
