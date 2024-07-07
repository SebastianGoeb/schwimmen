"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAbwesenheiten = parseAbwesenheiten;
exports.parseAbwesenheitenFromGrid = parseAbwesenheitenFromGrid;
function parseAbwesenheiten(data) {
    return parseAbwesenheitenFromGrid(data.split("\n").map((row) => row.split("\t")));
}
function parseAbwesenheitenFromGrid(rows) {
    return rows.map((row) => row[0]).filter((it) => it != undefined && it.length != 0);
}
