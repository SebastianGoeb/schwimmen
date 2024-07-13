export interface Staffel {
  name: string;
  disziplinen: string[];
  team: boolean;
}

export function parseStaffeln(data: string): Staffel[] {
  return parseStaffelnFromGrid(data.split("\n").map((row) => row.split("\t")));
}

export function parseStaffelnFromGrid(rows: string[][]): Staffel[] {
  const result: Staffel[] = [];
  let staffelBuilder: StaffelBuilder | undefined = undefined;
  for (const row of rows) {
    if (isHeader(row)) {
      if (staffelBuilder) {
        result.push(buildStaffel(staffelBuilder));
      }
      staffelBuilder = { name: row[0], startsDisziplinen: [] };
    }

    if (row[1].trim().length != 0) {
      if (!staffelBuilder) {
        throw Error("Konfigurationsformat falsch. Header 'Staffel' nicht gefunden.");
      }
      staffelBuilder.startsDisziplinen.push({ starts: Number(row[1]), disziplin: row[2] });
    }
  }

  if (staffelBuilder) {
    result.push(buildStaffel(staffelBuilder));
  }

  return result;
}

function isHeader(row: string[]): boolean {
  return row[0].trim().length > 0;
}

interface StaffelBuilder {
  name: string;
  startsDisziplinen: { starts: number; disziplin: string }[];
}
function buildStaffel(staffelBuilder: StaffelBuilder): Staffel {
  return {
    name: staffelBuilder.name,
    disziplinen: staffelBuilder.startsDisziplinen.flatMap(({ starts, disziplin }) => Array(starts).fill(disziplin)),
    team: staffelBuilder.name.toLowerCase().includes("team"),
  };
}
