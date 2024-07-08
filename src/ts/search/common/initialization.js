"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialRandomAssignment = initialRandomAssignment;
const times_1 = __importDefault(require("lodash/times"));
function initialRandomAssignment(konfiguration) {
    return { teams: (0, times_1.default)(konfiguration.anzahlTeams, () => generateTeam(konfiguration)) };
}
function generateTeam(konfiguration) {
    return {
        staffelBelegungen: konfiguration.staffeln.map((staffel, staffelId) => generateStaffelBelegung(staffel, staffelId, konfiguration)),
    };
}
function generateStaffelBelegung(staffel, staffelId, konfiguration) {
    return {
        staffelId,
        startBelegungen: staffel.disziplinIds.map((diszplinId) => generateStartBelegung(diszplinId, konfiguration)),
    };
}
function generateStartBelegung(disziplinId, konfiguration) {
    const schwimmerIdsZuDenenEsZeitenGibt = konfiguration.disziplinToSchwimmerZeiten[disziplinId];
    const index = Math.floor(Math.random() * schwimmerIdsZuDenenEsZeitenGibt.length);
    return schwimmerIdsZuDenenEsZeitenGibt[index].schwimmerId;
}
//# sourceMappingURL=initialization.js.map