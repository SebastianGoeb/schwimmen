import { StaffelBelegung, StateAndScore, Team } from "../search/state/state";
import { Konfiguration, StaffelX } from "../eingabe/konfiguration";
import { formatZeit } from "../util/zeit";

export function formatSheet(
  konfiguration: Konfiguration,
  state: StateAndScore,
  _duration: number,
  _checked: number,
  _messages: string[],
  staffelnPerRow: number,
): (string | undefined)[][] {
  const grid = [[undefined]];

  let rowIdx = 0;
  state.state.teams.forEach((team, teamIndex) => {
    const teamData = renderTeam(konfiguration, team, teamIndex, staffelnPerRow);
    place(grid, teamData, rowIdx, 0);
    rowIdx += teamData.length + 1;
  });

  return grid;
}

export function renderTeam(
  konfiguration: Konfiguration,
  team: Team,
  teamIndex: number,
  staffelnPerRow: number,
): (string | undefined)[][] {
  const grid: (string | undefined)[][] = [[undefined]];

  let rowIdx = 1;
  for (let i = 0; i < team.staffelBelegungen.length; i += staffelnPerRow) {
    const teamRowData = renderTeamRow(konfiguration, team.staffelBelegungen.slice(i, i + staffelnPerRow));
    place(grid, teamRowData, rowIdx, 0);
    rowIdx += teamRowData.length + 1;
  }

  grid[0][0] = `Team ${teamIndex + 1}`;

  return grid;
}

function renderTeamRow(konfiguration: Konfiguration, staffelBelegungen: StaffelBelegung[]): (string | undefined)[][] {
  const grid = [[undefined]];

  let colIdx = 0;
  for (const staffelBelegung of staffelBelegungen) {
    const staffelGrid = renderStaffeln(konfiguration, staffelBelegung);
    place(grid, staffelGrid, 0, colIdx);
    colIdx += gridWidth(staffelGrid) + 1;
  }
  return grid;
}

function gridToString(data: (string | undefined)[][]): (string | undefined)[][] {
  return data.map((row) => row.map((cell) => cell?.toString()));
}

export function renderStaffeln(
  konfiguration: Konfiguration,
  staffelBelegung: StaffelBelegung,
): (string | undefined)[][] {
  const staffel = konfiguration.staffeln[staffelBelegung.staffelId];
  const totalTime = staffelBelegung.startBelegungen
    .map(
      (schwimmerId, startId) => konfiguration.disziplinToSchwimmerToZeit[staffel.disziplinIds[startId]][schwimmerId]!,
    )
    .reduce((acc, x) => acc + x, 0);
  const multipleDisziplinen = new Set<number>(staffel.disziplinIds).size > 1;

  const headers = renderStaffelHeaders(staffelBelegung, staffel, multipleDisziplinen);
  const times = staffelBelegung.startBelegungen.map((schwimmerId, startId) =>
    renderStaffelData(
      konfiguration,
      schwimmerId,
      staffel.disziplinIds[startId],
      multipleDisziplinen ? staffel.disziplinNames[startId] : undefined,
    ),
  );
  const footer = renderStaffelFooter(totalTime, multipleDisziplinen);
  return gridToString(headers.concat(times, footer));
}

function renderStaffelHeaders(staffelBelegung: StaffelBelegung, staffel: StaffelX, wider: boolean) {
  return wider
    ? [
        [String(staffelBelegung.staffelId + 1), undefined, undefined],
        [staffel.name, undefined, undefined],
      ]
    : [
        [String(staffelBelegung.staffelId + 1), undefined],
        [staffel.name, undefined],
      ];
}

function renderStaffelData(
  konfiguration: Konfiguration,
  schwimmerId: number,
  disziplinId: number,
  disziplin: string | undefined,
): (string | undefined)[] {
  const schwimmer = konfiguration.schwimmerList[schwimmerId];
  const zeit = konfiguration.disziplinToSchwimmerToZeit[disziplinId][schwimmerId]!;
  if (disziplin !== undefined) {
    return [disziplin, schwimmer.name, formatZeit(zeit)];
  } else {
    return [schwimmer.name, formatZeit(zeit)];
  }
}

function renderStaffelFooter(totalTime: number, wider: boolean) {
  return wider ? [[undefined, undefined, formatZeit(totalTime)]] : [[undefined, formatZeit(totalTime)]];
}

function place(target: (string | undefined)[][], data: (string | undefined)[][], rowIdx: number, colIdx: number): void {
  const dataWidth = gridWidth(data);
  const dataHeight = data.length;

  const targetWidth = gridWidth(target);
  const targetHeight = target.length;

  // enlarge horizontally, if necessary
  if (targetWidth < colIdx + dataWidth) {
    target.forEach((row) => {
      for (let i = 0; i < colIdx + dataWidth - targetWidth; i++) {
        row.push(undefined);
      }
    });
  }

  // enlarge vertically, if necessary
  if (targetHeight < rowIdx + dataHeight) {
    for (let i = 0; i < rowIdx + dataHeight - targetHeight; i++) {
      target.push(Array(Math.max(targetWidth, colIdx + dataWidth)).fill(undefined));
    }
  }

  // put items
  data.forEach((row, i) => {
    row.forEach((cell, j) => {
      target[i + rowIdx][j + colIdx] = cell;
    });
  });
}

function gridWidth(data: (string | undefined)[][]) {
  return data.map((row) => row.length).reduce((a, b) => Math.max(a, b));
}
