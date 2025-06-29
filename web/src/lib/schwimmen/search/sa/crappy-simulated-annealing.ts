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
import { Result, resultFromState } from "../state/result.ts";
import { HistoryEntry, Progress } from "../state/progress.ts";
import { createWorkerpool } from "./parallel.ts";
import { mutateRandom, MutationResult } from "./mutation.ts";
import hash from "object-hash";

export type ProgressFun = (progress: Progress) => void;

interface StateAndScore {
  state: State;
  score: number;
  generation: number;
  history: HistoryEntry[];
}

function calcProgress(start: Date, totalStatesChecked: number, states: StateAndScore[]): Progress {
  return {
    duration: (new Date().getTime() - start.getTime()) / 1000,
    checked: totalStatesChecked,
    history: states.map((it) => it.history),
  };
}

function nextState(result: MutationResult, previousState: StateAndScore, generation: number): StateAndScore {
  return {
    state: result.state,
    score: result.score,
    history: [...previousState.history, createHistoryEntry(result.score, result.state)],
    generation,
  };
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
    const [results, statesChecked] = await generateNewStates(states, configuration, workerPool);
    totalStatesChecked += statesChecked;

    // update individual states / best
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const bestState = bestStates[i];
      if (result.score < bestState.score) {
        states[i] = nextState(result, states[i], generation);
        bestStates[i] = states[i];
      } else {
        // teleport away from local optimum
        if (Math.random() < 0.2) {
          // mostly to somewhere close to this local optimum
          const newStartingPoint = mutateRandom(bestState.state, configuration, { mutations: 3 });
          states[i] = nextState(newStartingPoint, states[i], generation);
        } else {
          // but sometimes somewhere close to the overall best known optimum
          const newStartingPoint = mutateRandom(globalBestState.state, configuration, { mutations: 3 });
          states[i] = nextState(newStartingPoint, states[i], generation);
        }
        // if (generation > bestState.generation + hyperparameters.restartGenerationLimit) {
        //   // if no improvement for a while, reset individual to global best
        //   const newStartingPoint = mutateRandom(globalBestState.state, configuration, { mutations: 5 });
        //   states[i] = { ...newStartingPoint, generation };
        // } else if (result.score > bestState.score && Math.random() < hyperparameters.acceptanceProbability) {
        //   // if worse than before, randomly decide whether to keep worse state
        //   states[i] = { ...result, generation };
        // }
      }
    }

    // update global best
    const newBestState = minBy(states, (it) => it.score)!;
    if (newBestState.score < globalBestState.score) {
      globalBestState = newBestState;
    }

    progressFun(calcProgress(start, totalStatesChecked, states));

    // if no global improvement for a while, stop entirely
    if (generation > globalBestState.generation + hyperparameters.globalGenerationLimit) {
      break;
    }
  }

  const result = resultFromState(parameters, configuration, globalBestState.state);
  return [result, calcProgress(start, totalStatesChecked, states)];
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
  workerpool: Pool,
): Promise<[MutationResult[], number]> {
  const promises: Promise<MutationResult>[] = states.map(
    (state) => workerpool.exec("mutateVerySmart", [state.state, configuration]) as unknown as Promise<MutationResult>,
    //     Math.random() < hyperparameters.smartMutationRate
    // ? ()
    // : (workerpool.exec("mutateRandom", [state.state, configuration]) as unknown as Promise<MutationResult>),
  );

  const results = await Promise.all(promises);
  const totalStatesChecked = sumBy(results, (it) => it.statesChecked);
  return [results, totalStatesChecked];
}

function andScore(state: State, configuration: HighPerfConfiguration, generation: number): StateAndScore {
  const score = stateScore(state, configuration);
  return { state, score, generation, history: [createHistoryEntry(score, state)] };
}

function createHistoryEntry(score: number, state: State): HistoryEntry {
  return {
    score,
    hash: describeState(state),
    state: state.teams.flatMap((team) => team.relays.flatMap((leg) => leg.swimmerIndices)),
  };
}

function describeState(state: State): string {
  return (
    hash(state).slice(0, 6) +
    " - " +
    state.teams.map((team) => team.relays.map((relay) => relay.swimmerIndices.join(",")).join("|")).join("\n")
  );
  // return hash(state)
}
