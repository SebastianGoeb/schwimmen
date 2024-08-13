export function parseAbwesenheiten(data: string): string[] {
  return parseAbwesenheitenFromGrid(data.split("\n").map((row) => row.split("\t")));
}

export function parseAbwesenheitenFromGrid(rows: string[][]): string[] {
  return rows.map((row) => row[0]).filter((it) => it != undefined && it.length != 0);
}
