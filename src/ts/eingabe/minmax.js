"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMinMax = parseMinMax;
exports.parseMinMaxFromGrid = parseMinMaxFromGrid;
function parseMinMax(data) {
    return parseMinMaxFromGrid(data.split("\n").map((row) => row.split("\t")));
}
function maybeNumber(cell) {
    if (cell !== undefined && cell.trim().length != 0) {
        return Number(cell);
    }
    else {
        return undefined;
    }
}
function parseMinMaxFromGrid(rows) {
    return new Map(rows
        .filter((row) => row.length >= 2)
        .map((row) => [row[0], { min: maybeNumber(row[1]), max: maybeNumber(row[2]) }]));
}
//# sourceMappingURL=minmax.js.map