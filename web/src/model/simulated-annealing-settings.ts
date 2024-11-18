import { State, StateAndScore } from "../lib/schwimmen/search/state/state.ts";
import { HighPerfConfiguration } from "../lib/schwimmen/eingabe/configuration.ts";

export interface SimulatedAnnealingSettings {
  smartMutationRate: number;
  smartMutation: (state: State, konfiguration: HighPerfConfiguration) => { state: StateAndScore; checked: number };
  dumbMutation: (state: State, konfiguration: HighPerfConfiguration) => { state: StateAndScore; checked: number };
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}
