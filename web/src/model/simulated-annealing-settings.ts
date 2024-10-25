import { State, StateAndScore } from "../lib/schwimmen/search/state/state.ts";
import { Konfiguration } from "../lib/schwimmen/eingabe/konfiguration.ts";

export interface SimulatedAnnealingSettings {
  smartMutationRate: number;
  smartMutation: (state: State, konfiguration: Konfiguration) => { state: StateAndScore; checked: number };
  dumbMutation: (state: State, konfiguration: Konfiguration) => { state: StateAndScore; checked: number };
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}
