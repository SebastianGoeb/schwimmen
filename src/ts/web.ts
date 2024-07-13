import { parseStilZeiten, parseStilZeitenFromGrid } from "./eingabe/zeiten";
import { parseStaffeln, parseStaffelnFromGrid } from "./eingabe/staffeln";
import { parseMinMax, parseMinMaxFromGrid } from "./eingabe/minmax";
import { parseGeschlechter, parseGeschlechterFromGrid } from "./eingabe/geschlecht";
import { parseAbwesenheiten, parseAbwesenheitenFromGrid } from "./eingabe/abwesenheiten";
import { Hyperparameters, runCrappySimulatedAnnealing } from "./search/sa/crappy-simulated-annealing";
import { buildKonfiguration, Konfiguration, KonfigurationBuilder } from "./eingabe/konfiguration";
import { mutateRandom, mutateVerySmart } from "./search/sa/mutation";

function sliceSheet(sheet: string[][], startCol: string, endCol: string) {
  console.log(startCol.charCodeAt(0) - 65, endCol.charCodeAt(0) - 64);
  return sheet
    .map((row) => row.slice(startCol.charCodeAt(0) - 65, endCol.charCodeAt(0) - 64))
    .filter((row) => !row.every((cell) => cell.length === 0));
}

async function runSearch(text: string) {
  const sheet = text.split("\n").map((row) => row.split("\t"));
  console.log(
    sliceSheet(sheet, "A", "D"),
    sliceSheet(sheet, "F", "F"),
    sliceSheet(sheet, "H", "I"),
    sliceSheet(sheet, "K", "M"),
    sliceSheet(sheet, "O", "P"),
  );
  const zeiten = parseStilZeitenFromGrid(sliceSheet(sheet, "A", "D"));
  const abwesenheiten = parseAbwesenheitenFromGrid(sliceSheet(sheet, "F", "F"));
  const geschlechter = parseGeschlechterFromGrid(sliceSheet(sheet, "H", "I"));
  const minMax = parseMinMaxFromGrid(sliceSheet(sheet, "K", "M"));
  const staffeln = parseStaffelnFromGrid(sliceSheet(sheet, "O", "P"));

  for (let name of abwesenheiten) {
    geschlechter.delete(name);
  }

  const konfiguration: Konfiguration = buildKonfiguration({
    alleMuessenSchwimmen: true,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minDefault: 0,
    maxDefault: 5,
    anzahlTeams: 2,
    maxZeitspanneProStaffelSeconds: 1,
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
  const { state, duration, checked } = await runCrappySimulatedAnnealing(konfiguration, hyperparameters);
  console.log(state, duration, checked, `${Math.floor(checked / duration).toLocaleString()}/s`);
}

(global as any)["runSearch"] = runSearch;
