import { parseZeit } from "../util/zeit";

export interface Schwimmer {
  name: string;
  zeitenSeconds: Map<string, number>;
}

interface StilZeiten {
  stil: string;
  zeiten: SchwimmerZeit[];
}

interface SchwimmerZeit {
  name: string;
  zeitSeconds: number;
}

export function parseStilZeiten(data: string): Schwimmer[] {
  const rows = data.split("\n").map((row) => row.split("\t"));
  const zeitenByStil = parseStilZeitenFromGrid(rows);
  return groupBySchwimmer(zeitenByStil);
}

function parseStilZeitenFromGrid(rows: string[][]): StilZeiten[] {
  const rowGroups: StilZeiten[] = [];

  let group: StilZeiten | undefined = undefined;
  for (const row of rows) {
    if (isHeaderRow(row)) {
      // finish previous group, if necessary
      if (group != null) {
        rowGroups.push(group);
      }

      // start new group
      group = { stil: row[0], zeiten: [] };
    }

    // process zeit
    if (group !== undefined) {
      const schwimmerZeit = parseSchwimmerZeitRow(group.stil, row);
      if (schwimmerZeit) {
        group.zeiten.push(schwimmerZeit);
      }
    } else {
      console.log(`Es gibt Zeiteinträge, die keinem Schwimmstil zugeordnet sind: ${row.join(" ")}`);
    }
  }

  // finish final group, if necessary
  if (group != null) {
    rowGroups.push(group);
  }

  return rowGroups;
}

function isHeaderRow(row: string[]) {
  return !isBlank(row[0]);
}

function parseSchwimmerZeitRow(stil: string, row: string[]): SchwimmerZeit | undefined {
  const nameCell = row[1] ?? "";
  if (isBlank(nameCell)) {
    return undefined;
  }

  const zeitCell = row[3] ?? "";
  if (isBlank(zeitCell)) {
    console.log(`Warnung, es gibt Namen ohne Zeiten im Stil '$stil': ${row.join(" ")}`);
    return undefined;
  }

  return { name: nameCell, zeitSeconds: parseZeit(zeitCell) };
}

function groupBySchwimmer(stilZeitenList: StilZeiten[]): Schwimmer[] {
  const schwimmerList: Map<string, Map<string, number>> = new Map();

  for (const stilZeiten of stilZeitenList) {
    for (const zeit of stilZeiten.zeiten) {
      if (!schwimmerList.has(zeit.name)) {
        schwimmerList.set(zeit.name, new Map<string, number>());
      }
      schwimmerList.get(zeit.name)?.set(stilZeiten.stil, zeit.zeitSeconds);
    }
  }

  return Array.from(schwimmerList.entries()).map(([key, value]) => ({ name: key, zeitenSeconds: value }));
}

function isBlank(s: string): boolean {
  return s.trim().length == 0;
}
