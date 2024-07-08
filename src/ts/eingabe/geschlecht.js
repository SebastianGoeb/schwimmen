"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Geschlecht = void 0;
exports.parseGeschlechter = parseGeschlechter;
exports.parseGeschlechterFromGrid = parseGeschlechterFromGrid;
function parseGeschlechter(data) {
    return parseGeschlechterFromGrid(data.split("\n").map((row) => row.split("\t")));
}
function parseGeschlechterFromGrid(rows) {
    return new Map(rows
        .filter((row) => row.length >= 2 && !isBlank(row[0]) && !isBlank(row[1]))
        .map((row) => [row[0], toGeschlecht(row[1])]));
}
function toGeschlecht(it) {
    if (it === "m") {
        return Geschlecht.MALE;
    }
    else if (it == "w") {
        return Geschlecht.FEMALE;
    }
    else {
        throw Error(`Unbekanntes Geschlecht ${it}`);
    }
}
var Geschlecht;
(function (Geschlecht) {
    Geschlecht[Geschlecht["MALE"] = 0] = "MALE";
    Geschlecht[Geschlecht["FEMALE"] = 1] = "FEMALE";
})(Geschlecht || (exports.Geschlecht = Geschlecht = {}));
function isBlank(s) {
    return s.trim().length == 0;
}
//# sourceMappingURL=geschlecht.js.map