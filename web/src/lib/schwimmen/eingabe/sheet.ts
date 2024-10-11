import { buildKonfiguration, Konfiguration, parseParametersFromGrid } from "./konfiguration";
import { Hyperparameters } from "../search/sa/crappy-simulated-annealing";
import { parseStilZeitenFromGrid } from "./zeiten";
import { Error, extractManyErrors, isError } from "../util/error";
import { parseAbwesenheitenFromGrid } from "./abwesenheiten";
import { parseGeschlechterFromGrid } from "./geschlecht";
import { parseMinMaxFromGrid } from "./minmax";
import { parseStaffelnFromGrid } from "./staffeln";
import { mutateRandom, mutateVerySmart } from "../search/sa/mutation";
import max from "lodash/max";

export interface SheetKonfiguration {
  konfiguration: Konfiguration;
  hyperparameters: Hyperparameters;
}

interface Coordinate {
  row: number;
  col: number;
}

function padGrid(data: string[][]): string[][] {
  const maxLength = max(data.map((row) => row.length))!;
  return data.map((row) => row.concat(Array(maxLength - row.length).fill("")));
}

export function parseSheet(data: string[][]): SheetKonfiguration | Error {
  const padded = padGrid(data);
  const zeiten = parse("Zeiten", 4, padded, parseStilZeitenFromGrid);
  const abwesenheiten = parse("Abwesenheiten", 1, padded, parseAbwesenheitenFromGrid);
  const geschlechter = parse("Geschlechter", 2, padded, parseGeschlechterFromGrid);
  const minMax = parse("Min/Max Starts", 3, padded, parseMinMaxFromGrid);
  const staffeln = parse("Staffeln", 3, padded, parseStaffelnFromGrid);
  const parameters = parse("Konfiguration", 3, padded, parseParametersFromGrid);

  if (
    isError(zeiten) ||
    isError(abwesenheiten) ||
    isError(geschlechter) ||
    isError(minMax) ||
    isError(staffeln) ||
    isError(parameters)
  ) {
    return extractManyErrors([zeiten, abwesenheiten, geschlechter, minMax, staffeln, parameters]);
  }

  // TODO handle errors here
  const konfiguration = buildKonfiguration({
    parameters,
    minMax,
    staffeln,
    schwimmerList: zeiten,
    geschlecht: geschlechter,
  });

  const hyperparameters: Hyperparameters = {
    smartMutationRate: 0.85,
    smartMutation: mutateVerySmart,
    dumbMutation: mutateRandom,
    acceptanceProbability: 0.1,
    globalGenerationLimit: 50,
    restartGenerationLimit: 20,
    maxGenerations: 1_000_000,
    populationSize: 10,
  };

  return { konfiguration, hyperparameters };
}

function parse<T>(header: string, columns: number, data: string[][], parseFn: (data: string[][]) => T): T | Error {
  const headerCoord = findHeader(header, data);
  if (headerCoord === undefined) {
    return { errors: [`Überschrift "${header}" konnte nicht gefunden werden.`] };
  }
  const gridCoord: Coordinate = { row: headerCoord.row + 2, col: headerCoord.col };
  const slice = sliceGrid(gridCoord, columns, data);
  return parseFn(slice);
}

function findHeader(header: string, data: string[][]): Coordinate | undefined {
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      if (data[row][col].toLowerCase() === header.toLowerCase()) {
        return { row, col };
      }
    }
  }
  return undefined;
}

function sliceGrid(coordinate: Coordinate, columns: number, data: string[][]): string[][] {
  return data.slice(coordinate.row).map((row) => row.slice(coordinate.col, coordinate.col + columns));
}
