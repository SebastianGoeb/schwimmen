"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamScore = teamScore;
const geschlecht_1 = require("../../eingabe/geschlecht");
const staffel_1 = require("./staffel");
const common_1 = require("./common");
function countSchwimmer(team, konfiguration) {
    const present = new Int8Array(konfiguration.schwimmerList.length);
    for (const staffelBelegung of team.staffelBelegungen) {
        for (const schwimmerId of staffelBelegung.startBelegungen) {
            present[schwimmerId] = 1;
        }
    }
    let sum = 0;
    for (const isPresent of present) {
        sum += isPresent;
    }
    return sum;
}
function countGeschlechter(team, konfiguration) {
    const male = 1;
    const female = 2;
    const geschlechter = new Int8Array(konfiguration.schwimmerList.length);
    for (const staffelBelegung of team.staffelBelegungen) {
        for (const schwimmerId of staffelBelegung.startBelegungen) {
            if (konfiguration.geschlecht[schwimmerId] == geschlecht_1.Geschlecht.MALE) {
                geschlechter[schwimmerId] = male;
            }
            else {
                geschlechter[schwimmerId] = female;
            }
        }
    }
    let males = 0;
    for (const g of geschlechter) {
        if (g == male) {
            males++;
        }
    }
    let females = 0;
    for (const g of geschlechter) {
        if (g == female) {
            females++;
        }
    }
    return { males, females };
}
function teamScore(team, konfiguration) {
    let staffelnScore = 0;
    for (const staffelBelegung of team.staffelBelegungen) {
        staffelnScore += (0, staffel_1.staffelScore)(staffelBelegung, konfiguration);
    }
    const anzahlSchwimmer = countSchwimmer(team, konfiguration);
    const minSchwimmerViolations = Math.max(konfiguration.minSchwimmerProTeam - anzahlSchwimmer, 0);
    const maxSchwimmerViolations = Math.max(anzahlSchwimmer - konfiguration.maxSchwimmerProTeam, 0);
    const { males, females } = countGeschlechter(team, konfiguration);
    const minMaleViolations = Math.max(konfiguration.minMaleProTeam - males, 0);
    const minFemaleViolations = Math.max(konfiguration.minFemaleProTeam - females, 0);
    return (staffelnScore +
        common_1.strafSekundenProRegelverstoss * minSchwimmerViolations +
        common_1.strafSekundenProRegelverstoss * maxSchwimmerViolations +
        common_1.strafSekundenProRegelverstoss * minMaleViolations +
        common_1.strafSekundenProRegelverstoss * minFemaleViolations);
}
//# sourceMappingURL=team.js.map