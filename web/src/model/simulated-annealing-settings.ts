export interface SimulatedAnnealingSettings {
  smartMutationRate: number;
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}
