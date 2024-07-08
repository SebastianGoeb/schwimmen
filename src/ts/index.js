"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const zeiten_1 = require("./eingabe/zeiten");
const fs = __importStar(require("node:fs"));
const staffeln_1 = require("./eingabe/staffeln");
const minmax_1 = require("./eingabe/minmax");
const geschlecht_1 = require("./eingabe/geschlecht");
const abwesenheiten_1 = require("./eingabe/abwesenheiten");
const crappy_simulated_annealing_1 = require("./search/sa/crappy-simulated-annealing");
const konfiguration_1 = require("./eingabe/konfiguration");
const mutation_1 = require("./search/sa/mutation");
const dir = process.argv[2];
const zeiten = (0, zeiten_1.parseStilZeiten)(fs.readFileSync(`src/main/resources/${dir}_jugend/zeiten.tsv`).toString());
const staffeln = (0, staffeln_1.parseStaffeln)(fs.readFileSync(`src/main/resources/staffeln.tsv`).toString());
const minMax = (0, minmax_1.parseMinMax)(fs.readFileSync(`src/main/resources/min_max.tsv`).toString());
const geschlechter = (0, geschlecht_1.parseGeschlechter)(fs.readFileSync(`src/main/resources/geschlecht_${dir}.tsv`).toString());
const abwesenheiten = (0, abwesenheiten_1.parseAbwesenheiten)(fs.readFileSync(`src/main/resources/abwesenheiten_${dir}.tsv`).toString());
for (let name of abwesenheiten) {
    geschlechter.delete(name);
}
const konfiguration = (0, konfiguration_1.buildKonfiguration)({
    alleMuessenSchwimmen: true,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minMax,
    minDefault: 0,
    maxDefault: 5,
    anzahlTeams: Number(process.argv[3]),
    maxZeitspanneProStaffelSeconds: 1,
    staffeln,
    schwimmerList: zeiten.filter((it) => !abwesenheiten.includes(it.name)),
    geschlecht: geschlechter,
});
const hyperparameters = {
    smartMutationRate: 0.85,
    smartMutation: mutation_1.mutateVerySmart,
    dumbMutation: mutation_1.mutateRandom,
    acceptanceProbability: 0.1,
    globalGenerationLimit: 10,
    restartGenerationLimit: 10,
    maxGenerations: 1000000,
    populationSize: 3,
};
const { state, duration, checked } = (0, crappy_simulated_annealing_1.runCrappySimulatedAnnealing)(konfiguration, hyperparameters);
console.log(state, duration, checked);
//# sourceMappingURL=index.js.map