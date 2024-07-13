import { State, StateAndScore } from "../state/state";
import { Konfiguration } from "../../eingabe/konfiguration";
import { initialRandomAssignment } from "../common/initialization";
import minBy from "lodash/minBy";
import times from "lodash/times";
import { stateScore } from "../score/state";
import { formatZeit } from "../../util/zeit";
import { Pool, pool, worker } from "workerpool";
import { WorkerUrl } from "worker-url";

export interface Hyperparameters {
  smartMutationRate: number;
  smartMutation: (state: State, konfiguration: Konfiguration) => { state: StateAndScore; checked: number };
  dumbMutation: (state: State, konfiguration: Konfiguration) => { state: StateAndScore; checked: number };
  acceptanceProbability: number;
  globalGenerationLimit: number;
  restartGenerationLimit: number;
  maxGenerations: number;
  populationSize: number;
}

export async function runCrappySimulatedAnnealing(
  konfiguration: Konfiguration,
  hyperparameters: Hyperparameters,
  printProgress: boolean = true,
): Promise<{ state: StateAndScore; duration: number; checked: number }> {
  const start = new Date();

  // @ts-ignore
  const WorkerURL = new WorkerUrl(new URL("../../../../dist/worker.js", import.meta.url));
  // const script = __dirname + "/worker.js";
  const workerPool = pool(WorkerURL.toString());

  let states: StateAndScore[] = times(hyperparameters.populationSize, () =>
    andScore(initialRandomAssignment(konfiguration), konfiguration),
  );
  let bestStates: StateAndScore[] = states;
  const bestGenerations: number[] = Array(hyperparameters.populationSize).fill(0);

  let statesChecked = 0;
  let bestState = minBy(states, (it) => it.score)!;
  let genOfBestState = 0;
  let timeOfBestState = new Date();

  if (printProgress) {
    console.log("Score progress");
  }

  for (let gen = 0; gen < hyperparameters.maxGenerations; gen++) {
    const { states: newStates, checked } = await generateNewStates(states, konfiguration, hyperparameters, workerPool);
    statesChecked += checked;

    for (let i = 0; i < newStates.length; i++) {
      const newState = newStates[i];
      const oldState = bestStates[i];
      if (newState.score < oldState.score) {
        bestGenerations[i] = gen;
        bestStates[i] = newState;
      } else if (gen > bestGenerations[i] + hyperparameters.restartGenerationLimit) {
        // if no improvement for a while, reset individual to global best
        bestGenerations[i] = gen;
        newStates[i] = bestState;
      } else if (newState.score > oldState.score && Math.random() < hyperparameters.acceptanceProbability) {
        // if worse than before, randomly decide whether to keep worse state
        // TODO probability is backwards (should be called rejectionProbability)
        newStates[i] = oldState;
      }
    }

    states = newStates;
    const newBestState = minBy(states, (it) => it.score)!;

    if (newBestState.score < bestState.score) {
      bestState = newBestState;
      genOfBestState = gen;
      timeOfBestState = new Date();
      if (printProgress) {
        /*if (bestErgebnis.valide) "✓" else "✗"*/
        console.log(`${formatZeit(bestState.score)} ? (gen ${gen})`);
        // console.log(JSON.stringify(bestState));
      }
    }

    if (gen > genOfBestState + hyperparameters.globalGenerationLimit) {
      break;
    }
  }

  if (printProgress) {
    console.log();
  }

  const end = new Date();
  return {
    state: bestState,
    duration: (end.getTime() - start.getTime()) / 1000,
    checked: statesChecked,
  };
}

async function generateNewStates(
  states: StateAndScore[],
  konfiguration: Konfiguration,
  hyperparameters: Hyperparameters,
  workerpool: Pool,
): Promise<{ states: StateAndScore[]; checked: number }> {
  const newStates: StateAndScore[] = [];
  let totalChecked = 0;

  const promises: Promise<{ state: StateAndScore; checked: number }>[] = [];

  for (const oldState of states) {
    // noinspection ES6MissingAwait
    const promise: Promise<{ state: StateAndScore; checked: number }> =
      Math.random() < hyperparameters.smartMutationRate
        ? workerpool.exec("mutateVerySmart", [oldState.state, konfiguration])
        : (workerpool.exec("mutateRandom", [oldState.state, konfiguration]) as any);
    promises.push(promise);
  }

  const results = await Promise.all(promises);
  for (let result of results) {
    newStates.push(result.state);
    totalChecked += result.checked;
  }

  return { states: newStates, checked: totalChecked };
}

function andScore(state: State, konfiguration: Konfiguration): StateAndScore {
  return { state, score: stateScore(state, konfiguration) };
}
