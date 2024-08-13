import { parseStilZeiten } from "./eingabe/zeiten";
import * as fs from "node:fs";
import { parseStaffeln } from "./eingabe/staffeln";
import { parseMinMax } from "./eingabe/minmax";
import { parseGeschlechter } from "./eingabe/geschlecht";
import { parseAbwesenheiten } from "./eingabe/abwesenheiten";
import { Hyperparameters, runCrappySimulatedAnnealing } from "./search/sa/crappy-simulated-annealing";
import { buildKonfiguration, Konfiguration, KonfigurationBuilder } from "./eingabe/konfiguration";
import { mutateRandom, mutateVerySmart } from "./search/sa/mutation";

const dir = process.argv[2];
const zeiten = parseStilZeiten(fs.readFileSync(`src/main/resources/${dir}_jugend/zeiten.tsv`).toString());
const staffeln = parseStaffeln(fs.readFileSync(`src/main/resources/staffeln.tsv`).toString());
const minMax = parseMinMax(fs.readFileSync(`src/main/resources/min_max.tsv`).toString());
const geschlechter = parseGeschlechter(fs.readFileSync(`src/main/resources/geschlecht_${dir}.tsv`).toString());
const abwesenheiten = parseAbwesenheiten(fs.readFileSync(`src/main/resources/abwesenheiten_${dir}.tsv`).toString());

for (let name of abwesenheiten) {
  geschlechter.delete(name);
}

const konfiguration: Konfiguration = buildKonfiguration({
  parameters: {
    alleMuessenSchwimmen: true,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minStartsProSchwimmer: 0,
    maxStartsProSchwimmer: 5,
    maxZeitspanneProStaffelSeconds: 1,
    anzahlTeams: Number(process.argv[3]),
  },
  minMax,
  staffeln,
  schwimmerList: zeiten.filter((it) => !abwesenheiten.includes(it.name)),
  geschlecht: geschlechter,
});

const hyperparameters: Hyperparameters = {
  smartMutationRate: 0.85,
  smartMutation: mutateVerySmart,
  dumbMutation: mutateRandom,
  acceptanceProbability: 0.1,
  globalGenerationLimit: 100,
  restartGenerationLimit: 50,
  maxGenerations: 1_000_000,
  populationSize: 50,
};

async function run() {
  const { state, duration, checked } = await runCrappySimulatedAnnealing(konfiguration, hyperparameters);
  console.log(state, duration, checked, `${Math.floor(checked / duration).toLocaleString()}/s`);
  process.exit(0);
}
run();
