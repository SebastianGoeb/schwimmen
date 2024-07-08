"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildKonfiguration = buildKonfiguration;
exports.getZeit = getZeit;
// function buildSchwimmerNameToId(schwimmerList: Schwimmer[]): Map<string, number> {
//   const result = new Map<string, number>();
//   for (let schimmerId = 0; schimmerId < schwimmerList.length; schimmerId++) {
//     result.set(schwimmerList[schimmerId].name, schimmerId);
//   }
//   return result;
// }
function buildDisziplinNameToId(disziplinen) {
    const result = new Map();
    for (let schimmerId = 0; schimmerId < disziplinen.length; schimmerId++) {
        result.set(disziplinen[schimmerId], schimmerId);
    }
    return result;
}
function buildDisziplinen(staffeln) {
    const result = new Set();
    for (const staffel of staffeln) {
        for (const disziplin of staffel.disziplinen) {
            result.add(disziplin);
        }
    }
    return Array.from(result);
}
function buildMinStartsProSchwimmer(konfigurationBuilder) {
    var _a, _b;
    const result = new Int8Array(konfigurationBuilder.schwimmerList.length);
    for (let schwimmerId = 0; schwimmerId < konfigurationBuilder.schwimmerList.length; schwimmerId++) {
        result[schwimmerId] =
            (_b = (_a = konfigurationBuilder.minMax.get(konfigurationBuilder.schwimmerList[schwimmerId].name)) === null || _a === void 0 ? void 0 : _a.min) !== null && _b !== void 0 ? _b : konfigurationBuilder.minDefault;
    }
    return result;
}
function buildMaxStartsProSchwimmer(konfigurationBuilder) {
    var _a, _b;
    const result = new Int8Array(konfigurationBuilder.schwimmerList.length);
    for (let schwimmerId = 0; schwimmerId < konfigurationBuilder.schwimmerList.length; schwimmerId++) {
        result[schwimmerId] =
            (_b = (_a = konfigurationBuilder.minMax.get(konfigurationBuilder.schwimmerList[schwimmerId].name)) === null || _a === void 0 ? void 0 : _a.max) !== null && _b !== void 0 ? _b : konfigurationBuilder.maxDefault;
    }
    return result;
}
function buildGeschlecht(konfigurationBuilder) {
    return konfigurationBuilder.schwimmerList.map((schwimmer) => {
        const geschlecht = konfigurationBuilder.geschlecht.get(schwimmer.name);
        if (geschlecht === undefined) {
            throw Error(`Geschlecht für Schwimmer ${schwimmer.name} wurde nicht gefunden`);
        }
        return geschlecht;
    });
}
function buildDisziplinToSchwimmerToZeit(disziplinen, konfigurationBuilder) {
    return disziplinen.map((disziplin) => konfigurationBuilder.schwimmerList.map((schwimmer) => schwimmer.zeitenSeconds.get(disziplin)));
}
function buildDisziplinToSchwimmerZeiten(disziplinen, konfigurationBuilder) {
    return disziplinen.map((disziplin) => konfigurationBuilder.schwimmerList
        .map((schwimmer, schwimmerId) => ({
        schwimmerId: schwimmerId,
        zeit: schwimmer.zeitenSeconds.get(disziplin),
    }))
        .filter(hasZeit));
}
function hasZeit(argument) {
    return argument.zeit !== undefined;
}
function buildStaffelX(staffel, disziplinNameToId) {
    return {
        name: staffel.name,
        disziplinIds: staffel.disziplinen.map((disziplin) => disziplinNameToId.get(disziplin)),
        team: staffel.team,
    };
}
function buildKonfiguration(konfigurationBuilder) {
    const disziplinen = buildDisziplinen(konfigurationBuilder.staffeln);
    const disziplinNameToId = buildDisziplinNameToId(disziplinen);
    // const schwimmerNameToId = buildSchwimmerNameToId(konfigurationBuilder.schwimmerList);
    const minStartsProSchwimmer = buildMinStartsProSchwimmer(konfigurationBuilder);
    const maxStartsProSchwimmer = buildMaxStartsProSchwimmer(konfigurationBuilder);
    const geschlecht = buildGeschlecht(konfigurationBuilder);
    const disziplinToSchwimmerToZeit = buildDisziplinToSchwimmerToZeit(disziplinen, konfigurationBuilder);
    const staffeln = konfigurationBuilder.staffeln.map((staffel) => buildStaffelX(staffel, disziplinNameToId));
    const disziplinToSchwimmerZeiten = buildDisziplinToSchwimmerZeiten(disziplinen, konfigurationBuilder);
    return {
        alleMuessenSchwimmen: konfigurationBuilder.alleMuessenSchwimmen,
        minSchwimmerProTeam: konfigurationBuilder.minSchwimmerProTeam,
        maxSchwimmerProTeam: konfigurationBuilder.maxSchwimmerProTeam,
        minMaleProTeam: konfigurationBuilder.minMaleProTeam,
        minFemaleProTeam: konfigurationBuilder.minFemaleProTeam,
        minStartsProSchwimmer,
        maxStartsProSchwimmer,
        anzahlTeams: konfigurationBuilder.anzahlTeams,
        maxZeitspanneProStaffelSeconds: konfigurationBuilder.maxZeitspanneProStaffelSeconds,
        staffeln,
        schwimmerList: konfigurationBuilder.schwimmerList,
        geschlecht,
        disziplinToSchwimmerToZeit,
        disziplinToSchwimmerZeiten,
    };
}
function getZeit(konfiguration, disziplinId, schwimmerId) {
    const zeit = konfiguration.disziplinToSchwimmerToZeit[disziplinId][schwimmerId];
    if (zeit === undefined) {
        throw Error("Programmierfehler");
    }
    return zeit;
}
//# sourceMappingURL=konfiguration.js.map