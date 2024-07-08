"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStaffeln = parseStaffeln;
exports.parseStaffelnFromGrid = parseStaffelnFromGrid;
function parseStaffeln(data) {
    return parseStaffelnFromGrid(data.split("\n").map((row) => row.split("\t")));
}
function parseStaffelnFromGrid(rows) {
    const result = [];
    let staffelBuilder = undefined;
    for (const row of rows) {
        if (isHeader(row)) {
            if (staffelBuilder) {
                result.push(buildStaffel(staffelBuilder));
            }
            staffelBuilder = { name: row[1], startsDisziplinen: [] };
        }
        else if (row[0].trim().length != 0) {
            if (!staffelBuilder) {
                throw Error("Konfigurationsformat falsch. Header 'Staffel' nicht gefunden.");
            }
            staffelBuilder.startsDisziplinen.push({ starts: Number(row[0]), disziplin: row[1] });
        }
    }
    if (staffelBuilder) {
        result.push(buildStaffel(staffelBuilder));
    }
    return result;
}
function isHeader(row) {
    return row[0].trim() === "Staffel";
}
function buildStaffel(staffelBuilder) {
    return {
        name: staffelBuilder.name,
        disziplinen: staffelBuilder.startsDisziplinen.flatMap(({ starts, disziplin }) => Array(starts).fill(disziplin)),
        team: staffelBuilder.name.toLowerCase().includes("team"),
    };
}
//# sourceMappingURL=staffeln.js.map