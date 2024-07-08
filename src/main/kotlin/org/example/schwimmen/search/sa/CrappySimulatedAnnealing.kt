package org.example.schwimmen.search.sa

import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.StartBelegung
import org.example.schwimmen.search.State
import org.example.schwimmen.search.common.initialRandomAssignment
import org.example.schwimmen.util.formatZeit
import org.example.schwimmen.util.replace
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.DurationUnit.MILLISECONDS
import kotlin.time.DurationUnit.MINUTES
import kotlin.time.TimeSource.Monotonic.markNow

val knownStatesCompressed = HashSet<List<Int>>()
var hits = AtomicLong(0)
var accesses = AtomicLong(0)

data class Hyperparameters(
    val smartMutationRate: Double,
    val smartMutation: (State) -> Pair<State, Int>,
    val dumbMutation: (State) -> Pair<State, Int>,
    val acceptanceProbability: Double,
    val globalGenerationLimit: Int,
    val restartGenerationLimit: Int,
    val maxGenerations: Int,
    val populationSize: Int,
)

fun runCrappySimulatedAnnealing(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
    printProgress: Boolean = true,
): Triple<State, Duration, Int> {
    val start = markNow()

    var states: List<State> = MutableList(hyperparameters.populationSize) { State(initialRandomAssignment(konfiguration), konfiguration) }
    val bestStates: MutableList<State> = ArrayList(states)
    val bestGenerations = states.mapTo(mutableListOf()) { 0 }

    val statesChecked = AtomicInteger(0)
    var bestErgebnis = states.minBy { it.score }
    var genOfBestErgebnis = 0
    var timeOfBestErgebnis = markNow()

    // dann schwimmer austauschen bis max starts eingehalten sind
    if (printProgress) {
        println("Score progress")
    }
    for (gen in 0..<hyperparameters.maxGenerations) {
        val newStates: List<State> =
            states
                .parallelStream()
                .map {
                    val (newState, newStatesChecked) = generateNewState(hyperparameters, it)
                    statesChecked.addAndGet(newStatesChecked)
                    newState
                }.toList()
                .zip(bestStates)
                .mapIndexed { index, (new, best) ->
                    if (new.score < best.score) {
                        bestGenerations[index] = gen
                        bestStates[index] = new
                    } else if (gen > bestGenerations[index] + hyperparameters.restartGenerationLimit) {
                        // restart individual
                        bestGenerations[index] = gen
                        return@mapIndexed bestErgebnis
                    }
                    return@mapIndexed new
                }.zip(states)
                .map { (new, old) ->
                    if (new.score > old.score && Random.nextDouble() < hyperparameters.acceptanceProbability) {
                        return@map old
                    } else {
                        return@map new
                    }
                }
        states = newStates

        val newBestErgebnis = states.minBy { it.score }

        if (newBestErgebnis.score < bestErgebnis.score) {
            bestErgebnis = newBestErgebnis
            genOfBestErgebnis = gen
            timeOfBestErgebnis = markNow()
            if (printProgress) {
                println("${formatZeit(bestErgebnis.score)} ${if (bestErgebnis.valide) "✓" else "✗"} (gen $gen)")
//                println(
//                    "cache hit rate: ${(hits.get().toDouble() / accesses.get() * 100)}% ($hits/$accesses), current size=${knownStatesCompressed.size}",
//                )
            }
        }

        if (gen > genOfBestErgebnis + hyperparameters.globalGenerationLimit) {
            break
        }
    }
    if (printProgress) {
        println()
//        println(
//            "cache hit rate: ${(hits.get().toDouble() / accesses.get() * 100)}% ($hits/$accesses), current size=${knownStatesCompressed.size}",
//        )
    }

    return Triple(bestErgebnis, timeOfBestErgebnis - start, statesChecked.get())
}

private fun generateNewState(
    hyperparameters: Hyperparameters,
    state: State,
) = if (Random.nextDouble() < hyperparameters.smartMutationRate) {
    hyperparameters.smartMutation(state)
} else {
    hyperparameters.dumbMutation(state)
}

fun mutateHeuristically(state: State): Pair<State, Int> {
    val replacementCandidates = mutableListOf<Pair<Triple<Int, Int, Int>, Double>>()

    state.teams.forEachIndexed { teamIndex, team ->
        team.staffelBelegungen.forEachIndexed { staffelIndex, staffelBelegung ->
            val staffelMinMinutes =
                staffelBelegung.startBelegungen
                    .asSequence()
                    .map { state.konfiguration.getZeit(it.disziplinId, it.schwimmerId).toDouble(MINUTES) }
                    .min()
            staffelBelegung.startBelegungen.forEachIndexed { startIndex, startBelegung ->
                val minutes = state.konfiguration.getZeit(startBelegung.disziplinId, startBelegung.schwimmerId).toDouble(MINUTES)
                replacementCandidates.add(Pair(Triple(teamIndex, staffelIndex, startIndex), minutes - staffelMinMinutes))
            }
        }
    }

    // select replacement candidate proportionally
    val cumulativeMinutes = replacementCandidates.map { it.second }.runningReduce { a, b -> a + b }
    val cutoff = Random.nextDouble(cumulativeMinutes.last())
    val candidateIndex = cumulativeMinutes.indexOfFirst { it > cutoff }
    val (teamIndex, staffelIndex, startIndex) = replacementCandidates[candidateIndex].first

    val team = state.teams[teamIndex]
    val staffelBelegung = team.staffelBelegungen[staffelIndex]
    val startBelegung = staffelBelegung.startBelegungen[startIndex]

    val schwimmerZeiten = state.konfiguration.getZeiten(disziplinId = startBelegung.disziplinId)

    val neueSchwimmerId =
        schwimmerZeiten
            .filter { it.schwimmerId != startBelegung.schwimmerId }
            .random()
            .schwimmerId

    val candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId)
    updateHitRate(candidate)
    return Pair(candidate, 1)
}

fun mutateRandom(state: State): Pair<State, Int> {
    val teamIndex = state.teams.indices.random()
    val team = state.teams[teamIndex]

    val staffelIndex = team.staffelBelegungen.indices.random()
    val staffelBelegung = team.staffelBelegungen[staffelIndex]

    val startIndex = staffelBelegung.startBelegungen.indices.random()
    val startBelegung = staffelBelegung.startBelegungen[startIndex]

    val schwimmerZeiten = state.konfiguration.getZeiten(disziplinId = startBelegung.disziplinId)

    val neueSchwimmerId =
        schwimmerZeiten
            .filter { it.schwimmerId != startBelegung.schwimmerId }
            .random()
            .schwimmerId

    val candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId)
    updateHitRate(candidate)
    return Pair(candidate, 1)
}

fun mutateSmart(state: State): Pair<State, Int> {
    var best: State? = null
    var tried = 0

    for (teamIndex in state.teams.indices) {
        val team = state.teams[teamIndex]

        for (staffelIndex in team.staffelBelegungen.indices) {
            val staffelBelegung = team.staffelBelegungen[staffelIndex]

            for (startIndex in staffelBelegung.startBelegungen.indices) {
                val startBelegung = staffelBelegung.startBelegungen[startIndex]
                val neueSchwimmerId =
                    state.konfiguration
                        .getZeiten(disziplinId = startBelegung.disziplinId)
                        .filter { it.schwimmerId != startBelegung.schwimmerId }
                        .random()
                        .schwimmerId
                val candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, neueSchwimmerId)
                if (best == null || candidate.score < best.score) {
                    best = candidate
                }
                tried++
                updateHitRate(candidate)
            }
        }
    }

    return Pair(best!!, tried)
}

fun mutateVerySmart(state: State): Pair<State, Int> {
    var best: State? = null
    var tried = 0

    for (teamIndex in state.teams.indices) {
        val team = state.teams[teamIndex]

        for (staffelIndex in team.staffelBelegungen.indices) {
            val staffelBelegung = team.staffelBelegungen[staffelIndex]

            for (startIndex in staffelBelegung.startBelegungen.indices) {
                val startBelegung = staffelBelegung.startBelegungen[startIndex]

                for (schwimmerIdZeit in state.konfiguration.getZeiten(disziplinId = startBelegung.disziplinId)) {
                    if (schwimmerIdZeit.schwimmerId != startBelegung.schwimmerId) {
                        val candidate = replaceSchwimmer(state, teamIndex, staffelIndex, startIndex, schwimmerIdZeit.schwimmerId)
                        if (best == null || candidate.score < best.score) {
                            best = candidate
                        }
                        tried++
                        updateHitRate(candidate)
                    }
                }
            }
        }
    }

    return Pair(best!!, tried)
}

private fun updateHitRate(state: State) {
//    val compressed = state.compress()
//    synchronized(knownStatesCompressed) {
//        if (knownStatesCompressed.contains(compressed)) {
//            hits.incrementAndGet()
//        } else {
//            knownStatesCompressed.add(compressed)
//        }
//        accesses.incrementAndGet()
//    }
}

private fun replaceSchwimmer(
    state: State,
    teamIndex: Int,
    staffelIndex: Int,
    startIndex: Int,
    neueSchwimmerId: Int,
): State {
    val team = state.teams[teamIndex]
    val staffelBelegung = team.staffelBelegungen[staffelIndex]
    val startBelegung = staffelBelegung.startBelegungen[startIndex]

    val neueStartBelegungen =
        staffelBelegung.startBelegungen.replace(startIndex, StartBelegung(neueSchwimmerId, startBelegung.disziplinId))
    val neueStaffelBelegungen =
        team.staffelBelegungen.replace(staffelIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))
    val neuesTeam =
        state.teams.replace(teamIndex, team.copy(staffelBelegungen = neueStaffelBelegungen))

    return State(neuesTeam, state.konfiguration)
}

private fun optimizeHyperparameters(konfiguration: Konfiguration) {
    val start = 0.5
    val end = 1
    val steps = 20
    val hyperparametersList =
        (0..steps).map {
            Hyperparameters(
                smartMutationRate = start * (1 - it / steps.toDouble()) + end * (it / steps.toDouble()),
                smartMutation = ::mutateVerySmart,
                dumbMutation = ::mutateRandom,
                acceptanceProbability = 0.5,
                globalGenerationLimit = 10_000,
                restartGenerationLimit = 1000,
                1_000_000,
                8,
            )
        }

    // warmup
    (1..20)
        .toList()
        .parallelStream()
        .forEach { runCrappySimulatedAnnealing(konfiguration, hyperparametersList.random(), printProgress = false) }

    val results =
        hyperparametersList
            .parallelStream()
            .map {
                println("running smr=${"%.3f".format(it.smartMutationRate)}")
                Pair(it, runHyperparameterExperiment(konfiguration, it))
            }.toList()

    println("sorted by rate:")
    results.sortedBy { it.first.smartMutationRate }.forEach {
        val avgScore = it.second.avgScore
        val maxScore = it.second.maxScore
        val avgTimeMillis = "%5.2fms".format(it.second.avgTime.toDouble(MILLISECONDS))
        val maxTimeMillis = "%6.2fms".format(it.second.maxTime.toDouble(MILLISECONDS))
        println(
            "smr=${
                "%.3f".format(
                    it.first.smartMutationRate,
                )
            }: avgTime=$avgTimeMillis, maxTime=$maxTimeMillis, avgScore=$avgScore, maxScore=$maxScore",
        )
    }

    println("optimal hyperparameters: " + results.minBy { it.second.avgTime })
}

private fun runHyperparameterExperiment(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
): ExperimentResult {
    // benchmark
    val runs = 10
    val results = (1..runs).map { runCrappySimulatedAnnealing(konfiguration, hyperparameters, printProgress = false) }
    val avgScore = results.map { it.first.score }.reduce(Duration::plus).div(runs)
    val maxScore = results.maxOf { it.first.score }
    val avgTime = results.map { it.second }.reduce(Duration::plus).div(runs)
    val maxTime = results.maxOf { it.second }
    return ExperimentResult(avgScore, maxScore, avgTime, maxTime)
}

data class ExperimentResult(
    val avgScore: Duration,
    val maxScore: Duration,
    val avgTime: Duration,
    val maxTime: Duration,
)
