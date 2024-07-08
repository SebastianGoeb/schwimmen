"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateRandom = mutateRandom;
exports.mutateVerySmart = mutateVerySmart;
const state_1 = require("../score/state");
function mutateRandom(state, konfiguration) {
    const teamIndex = randomIndex(state.teams);
    const team = state.teams[teamIndex];
    const staffelIndex = randomIndex(team.staffelBelegungen);
    const staffelBelegung = team.staffelBelegungen[staffelIndex];
    const startIndex = randomIndex(staffelBelegung.startBelegungen);
    const schwimmerId = staffelBelegung.startBelegungen[startIndex];
    const disziplinId = konfiguration.staffeln[staffelIndex].disziplinIds[startIndex];
    const schwimmerZeiten = konfiguration.disziplinToSchwimmerZeiten[disziplinId];
    const candidates = schwimmerZeiten.filter((it) => it.schwimmerId != schwimmerId);
    const neueSchwimmerId = candidates[randomIndex(candidates)].schwimmerId;
    const result = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId);
    return {
        state: {
            state: result,
            score: (0, state_1.stateScore)(state, konfiguration),
        },
        checked: 1,
    };
}
function mutateVerySmart(state, konfiguration) {
    let best = undefined;
    let checked = 0;
    for (let teamIndex = 0; teamIndex < state.teams.length; teamIndex++) {
        const team = state.teams[teamIndex];
        for (let staffelIndex = 0; staffelIndex < team.staffelBelegungen.length; staffelIndex++) {
            const staffelBelegung = team.staffelBelegungen[staffelIndex];
            for (let startIndex = 0; startIndex < staffelBelegung.startBelegungen.length; startIndex++) {
                const schwimmerId = staffelBelegung.startBelegungen[startIndex];
                const disziplinId = konfiguration.staffeln[staffelIndex].disziplinIds[startIndex];
                for (const schwimmerIdZeit of konfiguration.disziplinToSchwimmerZeiten[disziplinId]) {
                    if (schwimmerIdZeit.schwimmerId != schwimmerId) {
                        const candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, schwimmerIdZeit.schwimmerId);
                        const score = (0, state_1.stateScore)(candidate, konfiguration);
                        if (best === undefined || score < best.score) {
                            best = { state: candidate, score };
                        }
                        checked++;
                    }
                }
            }
        }
    }
    return {
        state: best,
        checked: 1,
    };
}
function replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId) {
    const team = state.teams[teamIndex];
    const staffelBelegung = team.staffelBelegungen[staffelIndex];
    const neueStartBelegungen = replace(staffelBelegung.startBelegungen, startIndex, neueSchwimmerId);
    const neueStaffelBelegungen = replace(team.staffelBelegungen, staffelIndex, Object.assign(Object.assign({}, staffelBelegung), { startBelegungen: neueStartBelegungen }));
    const neueTeams = replace(state.teams, teamIndex, Object.assign(Object.assign({}, team), { staffelBelegungen: neueStaffelBelegungen }));
    return { teams: neueTeams };
}
function randomIndex(array) {
    return Math.floor(Math.random() * array.length);
}
function replace(array, index, value) {
    const copy = array.slice();
    copy[index] = value;
    return copy;
}
//# sourceMappingURL=mutation.js.map