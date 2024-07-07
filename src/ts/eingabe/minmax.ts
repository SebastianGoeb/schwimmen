export interface MinMax {
  min: number | undefined;
  max: number | undefined;
}

export function parseMinMax(data: string): Map<string, MinMax> {
  return parseMinMaxFromGrid(data.split("\n").map((row) => row.split("\t")));
}

function maybeNumber(cell: string | undefined): number | undefined {
  if (cell !== undefined && cell.trim().length != 0) {
    return Number(cell);
  } else {
    return undefined;
  }
}

export function parseMinMaxFromGrid(rows: string[][]): Map<string, MinMax> {
  return new Map<string, MinMax>(
    rows

      .filter((row) => row.length >= 2)
      .map((row) => [row[0], { min: maybeNumber(row[1]), max: maybeNumber(row[2]) }]),
  );
}
