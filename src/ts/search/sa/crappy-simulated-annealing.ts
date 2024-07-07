import { State } from "../state/state";
import { Konfiguration } from "../../eingabe/konfiguration";
import { initialRandomAssignment } from "../common/initialization";

export interface Hyperparameters {
  smartMutationRate: number;
  smartMutation: (state: State) => { state: State; statesChecked: number };
  dumbMutation: (state: State) => { state: State; statesChecked: number };
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}

export function runCrappySimulatedAnnealing(
  konfiguration: Konfiguration,
  hyperparameter: Hyperparameters,
  printProgress: boolean = true,
) {
  const start = new Date();

  let states: State[] = Array(hyperparameter.populationSize).filter(() => initialRandomAssignment(konfiguration));
}
