"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStilZeiten = parseStilZeiten;
const zeit_1 = require("../util/zeit");
function parseStilZeiten(data) {
    const rows = data.split("\n").map((row) => row.split("\t"));
    const zeitenByStil = parseStilZeitenFromGrid(rows);
    return groupBySchwimmer(zeitenByStil);
}
function parseStilZeitenFromGrid(rows) {
    const rowGroups = [];
    let group = undefined;
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
        }
        else {
            console.log(`Es gibt Zeiteinträge, die keinem Schwimmstil zugeordnet sind: ${row.join(" ")}`);
        }
    }
    // finish final group, if necessary
    if (group != null) {
        rowGroups.push(group);
    }
    return rowGroups;
}
function isHeaderRow(row) {
    return !isBlank(row[0]);
}
function parseSchwimmerZeitRow(stil, row) {
    var _a, _b;
    const nameCell = (_a = row[1]) !== null && _a !== void 0 ? _a : "";
    if (isBlank(nameCell)) {
        return undefined;
    }
    const zeitCell = (_b = row[3]) !== null && _b !== void 0 ? _b : "";
    if (isBlank(zeitCell)) {
        console.log(`Warnung, es gibt Namen ohne Zeiten im Stil '$stil': ${row.join(" ")}`);
        return undefined;
    }
    return { name: nameCell, zeitSeconds: (0, zeit_1.parseZeit)(zeitCell) };
}
function groupBySchwimmer(stilZeitenList) {
    var _a;
    const schwimmerList = new Map();
    for (const stilZeiten of stilZeitenList) {
        for (const zeit of stilZeiten.zeiten) {
            if (!schwimmerList.has(zeit.name)) {
                schwimmerList.set(zeit.name, new Map());
            }
            (_a = schwimmerList.get(zeit.name)) === null || _a === void 0 ? void 0 : _a.set(stilZeiten.stil, zeit.zeitSeconds);
        }
    }
    return Array.from(schwimmerList.entries()).map(([key, value]) => ({ name: key, zeitenSeconds: value }));
}
function isBlank(s) {
    return s.trim().length == 0;
}
//# sourceMappingURL=zeiten.js.map