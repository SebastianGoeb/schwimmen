"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffelGesamtzeit = staffelGesamtzeit;
exports.staffelScore = staffelScore;
const konfiguration_1 = require("../../eingabe/konfiguration");
const geschlecht_1 = require("../../eingabe/geschlecht");
const common_1 = require("./common");
function staffelGesamtzeit(staffelBelegung, konfiguration) {
    const staffel = konfiguration.staffeln[staffelBelegung.staffelId];
    const startBelegungen = staffelBelegung.startBelegungen;
    let gesamtZeit = 0;
    for (let startId = 0; startId < startBelegungen.length; startId++) {
        const schwimmerId = startBelegungen[startId];
        const disziplinId = staffel.disziplinIds[startId];
        const zeit = (0, konfiguration_1.getZeit)(konfiguration, disziplinId, schwimmerId);
        gesamtZeit = staffel.team ? Math.max(gesamtZeit, zeit) : gesamtZeit + zeit;
    }
    return gesamtZeit;
}
function maxOneStartProSchwimmerViolations(staffelBelegung, konfiguration) {
    const starts = new Int8Array(konfiguration.schwimmerList.length);
    for (const schwimmerId of staffelBelegung.startBelegungen) {
        starts[schwimmerId]++;
    }
    let sum = 0;
    for (const numStarts of starts) {
        sum += Math.max(numStarts - 1, 0);
    }
    return sum;
}
function minOneMaleViolations(staffelBelegung, konfiguration) {
    let sum = 0;
    for (const schwimmerId of staffelBelegung.startBelegungen) {
        if (konfiguration.geschlecht[schwimmerId] == geschlecht_1.Geschlecht.MALE) {
            sum++;
        }
    }
    return Math.max(1 - sum, 0);
}
function minOneFemaleViolations(staffelBelegung, konfiguration) {
    let sum = 0;
    for (const schwimmerId of staffelBelegung.startBelegungen) {
        if (konfiguration.geschlecht[schwimmerId] == geschlecht_1.Geschlecht.FEMALE) {
            sum++;
        }
    }
    return Math.max(1 - sum, 0);
}
function staffelScore(staffelBelegung, konfiguration) {
    return (staffelGesamtzeit(staffelBelegung, konfiguration) +
        common_1.strafSekundenProRegelverstoss * maxOneStartProSchwimmerViolations(staffelBelegung, konfiguration) +
        common_1.strafSekundenProRegelverstoss * minOneMaleViolations(staffelBelegung, konfiguration) +
        common_1.strafSekundenProRegelverstoss * minOneFemaleViolations(staffelBelegung, konfiguration));
}
//# sourceMappingURL=staffel.js.map