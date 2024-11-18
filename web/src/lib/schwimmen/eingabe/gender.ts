export function parseGeschlechter(data: string): Map<string, Gender> {
  return parseGeschlechterFromGrid(data.split("\n").map((row) => row.split("\t")));
}

export function parseGeschlechterFromGrid(rows: string[][]): Map<string, Gender> {
  return new Map<string, Gender>(
    rows
      .filter((row) => row.length >= 2 && !isBlank(row[0]) && !isBlank(row[1]))
      .map((row) => [row[0], toGeschlecht(row[1])]),
  );
}

function toGeschlecht(it: string): Gender {
  if (it === "m") {
    return Gender.MALE;
  } else if (it == "w") {
    return Gender.FEMALE;
  } else {
    throw Error(`Unbekanntes Geschlecht ${it}`);
  }
}

export enum Gender {
  MALE,
  FEMALE,
}

function isBlank(s: string): boolean {
  return s.trim().length == 0;
}
