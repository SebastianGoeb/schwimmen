package org.example.schwimmen.search.ga

import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.SchwimmerStil
import org.example.schwimmen.model.Staffel
import org.example.schwimmen.search.Ergebnis
import org.example.schwimmen.search.ExperimentResult
import org.example.schwimmen.search.StaffelBelegung
import org.example.schwimmen.search.Team
import org.example.schwimmen.search.ga.pairing.RandomPairing
import org.example.schwimmen.util.formatZeit
import java.util.concurrent.atomic.AtomicInteger
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.TimeSource.Monotonic.markNow

data class Hyperparameters(
    val numElites: Int,
    val selection: (List<Ergebnis>) -> List<Ergebnis>,
    val crossoverProbability: Double,
    val crossover: (Ergebnis, Ergebnis) -> Ergebnis,
    val mutationProbability: Double,
    val mutate: (Ergebnis) -> Ergebnis,
    val timeout: Duration,
    val maxGenerations: Int,
    val populationSize: Int,
)

fun runGeneticAlgorithm(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
    printProgress: Boolean = true,
): Triple<Ergebnis, Duration, Int> {
    val start = markNow()
    if (printProgress) {
        println("Score progress")
    }

    var population: MutableList<Ergebnis> =
        MutableList(hyperparameters.populationSize) {
            Ergebnis(initialRandomAssignment(konfiguration), konfiguration)
        }
    val statesChecked = AtomicInteger(0)
    var bestErgebnis = population.minBy { it.score }
    var timeOfBestErgebnis = markNow()

    // dann schwimmer austauschen bis max starts eingehalten sind
    for (i in 0..<hyperparameters.maxGenerations) {
        // selection
        val populatedSorted = population.sortedByDescending { it.score }
        val elites = populatedSorted.take(hyperparameters.numElites)
        val nonElites = population.drop(hyperparameters.numElites)
        val selectedParents = elites + hyperparameters.selection(nonElites)

        // pairing
        // TODO options: sorted sequential, shuffled sequential, random, weighted random, rank random
        val pairing = RandomPairing(selectedParents)

        // reproduce (crossover/mutation)
        population =
            population.indices
                .toList()
                .parallelStream()
                .map {
                    val child = reproduce(hyperparameters, pairing)
                    mutate(hyperparameters, child)
                }.toList()

        val newBestErgebnis = population.minBy { it.score }
        statesChecked.addAndGet(population.size)

        if (newBestErgebnis.score < bestErgebnis.score) {
            bestErgebnis = newBestErgebnis
            timeOfBestErgebnis = markNow()
            if (printProgress) {
                println("${formatZeit(bestErgebnis.score)} ${if (bestErgebnis.valide) "✓" else "✗"} (gen $i)")
            }
        }

        if (markNow() - timeOfBestErgebnis > hyperparameters.timeout) {
            break
        }
    }
    if (printProgress) {
        println()
    }

    return Triple(bestErgebnis, timeOfBestErgebnis - start, statesChecked.get())
}

private fun reproduce(
    hyperparameters: Hyperparameters,
    pairing: RandomPairing,
): Ergebnis =
    if (Random.nextDouble() < hyperparameters.crossoverProbability) {
        val (parentA, parentB) = pairing.selectPair()
        hyperparameters.crossover(parentA, parentB)
    } else {
        pairing.selectSingle()
    }

private fun mutate(
    hyperparameters: Hyperparameters,
    individual: Ergebnis,
): Ergebnis =
    if (Random.nextDouble() < hyperparameters.mutationProbability) {
        hyperparameters.mutate(individual)
    } else {
        individual
    }

private fun initialOptimalAssignment(
    staffeln: List<Staffel>,
    konfiguration: Konfiguration,
): List<StaffelBelegung> {
    val staffelZuweisungen =
        staffeln.map { staffel ->
            val zuweisungen: List<SchwimmerStil> =
                staffel.stileAnzahl.flatMap { (stil, anzahl) ->
                    val schwimmerZeiten =
                        konfiguration.stilToSchwimmerZeiten[stil] ?: error("Keine Zeiten für Stil $stil gefunden")
                    schwimmerZeiten.take(anzahl).map { SchwimmerStil(it.name, stil) }
                }
            StaffelBelegung(staffel, konfiguration, zuweisungen)
        }
    return staffelZuweisungen
}

private fun initialRandomAssignment(konfiguration: Konfiguration): List<Team> =
    (1..konfiguration.anzahlTeams).map { i ->
        Team(
            "Team $i",
            konfiguration.staffeln.map { staffel ->
                StaffelBelegung(
                    staffel,
                    konfiguration,
                    staffel.stileAnzahl.flatMap { (stil, anzahl) ->
                        val schwimmerZeiten =
                            konfiguration.stilToSchwimmerZeiten[stil] ?: error("Keine Zeiten für Stil $stil gefunden")
                        schwimmerZeiten.shuffled().take(anzahl).map { SchwimmerStil(it.name, stil) }
                    },
                )
            },
            konfiguration,
        )
    }

// private fun optimizeHyperparameters(konfiguration: Konfiguration) {
//    val start = 0.5
//    val end = 1
//    val steps = 20
//    val hyperparametersList =
//        (0..steps).map { i ->
//            Hyperparameters(
//                numElites = 1,
//                selection = TournamentSelection(3, withReplacement = false)::selectParents,
//                crossoverProbability = 0.6,
//                crossover = OnePointStaffelCrossover()::crossover,
//                mutationProbability = 0.1,
//                mutate = { mutateRandom(it).first },
//                timeout = 5.seconds,
//                1_000_000,
//                8,
//            )
//        }
//
//    // warmup
//    (1..20)
//        .toList()
//        .parallelStream()
//        .forEach { runGeneticAlgorithm(konfiguration, hyperparametersList.random(), printProgress = false) }
//
//    val results =
//        hyperparametersList
//            .parallelStream()
//            .map {
//                println("running smr=${"%.3f".format(it)}")
//                Pair(it, runHyperparameterExperiment(konfiguration, it))
//            }.toList()
//
//    println("sorted by rate:")
//    results.sortedBy { it.first.smartMutationRate }.forEach {
//        val avgScore = it.second.avgScore
//        val maxScore = it.second.maxScore
//        val avgTimeMillis = "%5.2fms".format(it.second.avgTime.toDouble(MILLISECONDS))
//        val maxTimeMillis = "%6.2fms".format(it.second.maxTime.toDouble(MILLISECONDS))
//        println(
//            "smr=${
//                "%.3f".format(
//                    it.first.smartMutationRate,
//                )
//            }: avgTime=$avgTimeMillis, maxTime=$maxTimeMillis, avgScore=$avgScore, maxScore=$maxScore",
//        )
//    }
//
//    println("optimal hyperparameters: " + results.minBy { it.second.avgTime })
// }

private fun runHyperparameterExperiment(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
): ExperimentResult {
    // benchmark
    val runs = 10
    val results = (1..runs).map { runGeneticAlgorithm(konfiguration, hyperparameters, printProgress = false) }
    val avgScore = results.map { it.first.score }.reduce(Duration::plus).div(runs)
    val maxScore = results.maxOf { it.first.score }
    val avgTime = results.map { it.second }.reduce(Duration::plus).div(runs)
    val maxTime = results.maxOf { it.second }
    return ExperimentResult(avgScore, maxScore, avgTime, maxTime)
}
