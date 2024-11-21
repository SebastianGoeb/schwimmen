import { State } from "../state/state";
import {
  buildHighPerfConfiguration,
  HighPerfConfiguration,
  Hyperparameters,
  Parameters,
} from "../../eingabe/configuration.ts";
import { generateRandomState } from "../common/initialization";
import { minBy, sumBy, times } from "lodash-es";
import { stateScore } from "../score/state";
import type { Pool } from "workerpool";
import { resultFromState, Result } from "../state/result.ts";
import { Progress } from "../state/progress.ts";
import { createWorkerpool } from "./parallel.ts";
import { MutationResult } from "./mutation.ts";

export type ProgressFun = (progress: Progress) => void;

interface StateAndScore {
  state: State;
  score: number;
  generation: number;
}

function calcProgress(start: Date, totalStatesChecked: number): Progress {
  return { duration: (new Date().getTime() - start.getTime()) / 1000, checked: totalStatesChecked };
}

export async function runCrappySimulatedAnnealing(
  parameters: Parameters,
  hyperparameters: Hyperparameters,
  progressFun: ProgressFun = () => {},
): Promise<[Result, Progress]> {
  const start = new Date();
  const configuration = buildHighPerfConfiguration(parameters);
  const workerPool = createWorkerpool();

  const states: StateAndScore[] = generateInitialStates(hyperparameters, configuration, 0);
  const bestStates: StateAndScore[] = states;
  let globalBestState = minBy(states, (it) => it.score)!;
  let totalStatesChecked = 0;

  for (let generation = 1; generation < hyperparameters.maxGenerations; generation++) {
    const [results, statesChecked] = await generateNewStates(states, configuration, hyperparameters, workerPool);
    totalStatesChecked += statesChecked;

    // update individual states / best
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const bestState = bestStates[i];
      if (result.score < bestState.score) {
        states[i] = { ...result, generation };
        bestStates[i] = states[i];
      } else if (generation > bestState.generation + hyperparameters.restartGenerationLimit) {
        // if no improvement for a while, reset individual to global best
        states[i] = globalBestState;
      } else if (result.score > bestState.score && Math.random() < hyperparameters.acceptanceProbability) {
        // if worse than before, randomly decide whether to keep worse state
        states[i] = { ...result, generation };
      }
    }

    // update global best
    const newBestState = minBy(states, (it) => it.score)!;
    if (newBestState.score < globalBestState.score) {
      globalBestState = newBestState;
    }

    progressFun(calcProgress(start, totalStatesChecked));

    // if no global improvement for a while, stop entirely
    if (generation > globalBestState.generation + hyperparameters.globalGenerationLimit) {
      break;
    }
  }

  const result = resultFromState(parameters, configuration, globalBestState.state);
  return [result, calcProgress(start, totalStatesChecked)];
}

function generateInitialStates(
  hyperparameters: Hyperparameters,
  configuration: HighPerfConfiguration,
  generation: number,
) {
  return times(hyperparameters.populationSize, () =>
    andScore(generateRandomState(configuration), configuration, generation),
  );
}

async function generateNewStates(
  states: StateAndScore[],
  configuration: HighPerfConfiguration,
  hyperparameters: Hyperparameters,
  workerpool: Pool,
): Promise<[MutationResult[], number]> {
  const promises: Promise<MutationResult>[] = states.map((state) =>
    Math.random() < hyperparameters.smartMutationRate
      ? (workerpool.exec("mutateVerySmart", [state.state, configuration]) as unknown as Promise<MutationResult>)
      : (workerpool.exec("mutateRandom", [state.state, configuration]) as unknown as Promise<MutationResult>),
  );

  const results = await Promise.all(promises);
  const totalStatesChecked = sumBy(results, (it) => it.statesChecked);
  return [results, totalStatesChecked];
}

function andScore(state: State, configuration: HighPerfConfiguration, generation: number): StateAndScore {
  return { state, score: stateScore(state, configuration), generation };
}
