"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCrappySimulatedAnnealing = runCrappySimulatedAnnealing;
const initialization_1 = require("../common/initialization");
const minBy_1 = __importDefault(require("lodash/minBy"));
const times_1 = __importDefault(require("lodash/times"));
const state_1 = require("../score/state");
const zeit_1 = require("../../util/zeit");
function runCrappySimulatedAnnealing(konfiguration, hyperparameters, printProgress = true) {
    const start = new Date();
    let states = (0, times_1.default)(hyperparameters.populationSize, () => andScore((0, initialization_1.initialRandomAssignment)(konfiguration), konfiguration));
    let bestStates = states;
    const bestGenerations = Array(hyperparameters.populationSize).fill(0);
    let statesChecked = 0;
    let bestState = (0, minBy_1.default)(states, (it) => it.score);
    let genOfBestState = 0;
    let timeOfBestState = new Date();
    if (printProgress) {
        console.log("Score progress");
    }
    for (let gen = 0; gen < hyperparameters.maxGenerations; gen++) {
        const { states: newStates, checked } = generateNewStates(states, konfiguration, hyperparameters);
        statesChecked += checked;
        for (let i = 0; i < newStates.length; i++) {
            const newState = newStates[i];
            const oldState = bestStates[i];
            if (newState.score < oldState.score) {
                bestGenerations[i] = gen;
                bestStates[i] = newState;
            }
            else if (gen > bestGenerations[i] + hyperparameters.restartGenerationLimit) {
                // if no improvement for a while, reset individual to global best
                bestGenerations[i] = gen;
                newStates[i] = bestState;
            }
            else if (newState.score > oldState.score && Math.random() < hyperparameters.acceptanceProbability) {
                // if worse than before, randomly decide whether to keep worse state
                // TODO probability is backwards (should be called rejectionProbability)
                newStates[i] = oldState;
            }
        }
        states = newStates;
        const newBestState = (0, minBy_1.default)(states, (it) => it.score);
        if (newBestState.score < bestState.score) {
            bestState = newBestState;
            genOfBestState = gen;
            timeOfBestState = new Date();
            if (printProgress) {
                /*if (bestErgebnis.valide) "✓" else "✗"*/
                console.log(`${(0, zeit_1.formatZeit)(bestState.score)} ? (gen ${gen})`);
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
        duration: end.getTime() - start.getTime(),
        checked: statesChecked,
    };
}
function generateNewStates(states, konfiguration, hyperparameters) {
    const newStates = [];
    let totalChecked = 0;
    for (const oldState of states) {
        const { state, checked } = Math.random() < hyperparameters.smartMutationRate
            ? hyperparameters.smartMutation(oldState.state, konfiguration)
            : hyperparameters.dumbMutation(oldState.state, konfiguration);
        newStates.push(state);
        totalChecked += checked;
    }
    return { states: newStates, checked: totalChecked };
}
function andScore(state, konfiguration) {
    return { state, score: (0, state_1.stateScore)(state, konfiguration) };
}
//# sourceMappingURL=crappy-simulated-annealing.js.map