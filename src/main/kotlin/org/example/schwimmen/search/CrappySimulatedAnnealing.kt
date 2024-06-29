package org.example.schwimmen.search

import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.SchwimmerStil
import org.example.schwimmen.model.Staffel
import org.example.schwimmen.util.formatZeit
import org.example.schwimmen.util.replace
import java.util.concurrent.atomic.AtomicInteger
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit.MILLISECONDS
import kotlin.time.TimeSource.Monotonic.markNow

data class Hyperparameters(
    val smartMutationRate: Double,
    val smartMutation: (Ergebnis) -> Pair<Ergebnis, Int>,
    val dumbMutation: (Ergebnis) -> Pair<Ergebnis, Int>,
    val timeout: Duration,
    val maxGenerations: Int,
    val populationSize: Int,
)

fun runCrappySimulatedAnnealing(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
    printProgress: Boolean = true,
): Triple<Ergebnis, Duration, Int> {
    val start = markNow()

    var ergebnisse: MutableList<Ergebnis> =
        MutableList(hyperparameters.populationSize) {
            Ergebnis(initialRandomAssignment(konfiguration), konfiguration)
        }
    val statesChecked = AtomicInteger(0)
    var bestErgebnis = ergebnisse.minBy { it.score }
    var timeOfBestErgebnis = markNow()

    // dann schwimmer austauschen bis max starts eingehalten sind
    if (printProgress) {
        println("Score progress")
    }
    for (i in 0..<hyperparameters.maxGenerations) {
        ergebnisse =
            ergebnisse
                .parallelStream()
                .map {
                    val (newState, newStatesChecked) = generateNewState(hyperparameters, it)
                    statesChecked.addAndGet(newStatesChecked)
                    newState
                }.toList()
        val newBestErgebnis = ergebnisse.minBy { it.score }

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

private fun generateNewState(
    hyperparameters: Hyperparameters,
    state: Ergebnis,
) = if (Random.nextDouble() < hyperparameters.smartMutationRate) {
    hyperparameters.smartMutation(state)
} else {
    hyperparameters.dumbMutation(state)
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

fun mutateRandom(ergebnis: Ergebnis): Pair<Ergebnis, Int> {
    val teamIndex = ergebnis.teams.indices.random()
    val team = ergebnis.teams[teamIndex]

    val staffelBelegungenIndex = team.staffelBelegungen.indices.random()
    val staffelBelegung = team.staffelBelegungen[staffelBelegungenIndex]

    val startBelegungenIndex = staffelBelegung.startBelegungen.indices.random()
    val startBelegung = staffelBelegung.startBelegungen[startBelegungenIndex]

    val auszutauschenderName = startBelegung.name
    val schwimmerZeiten =
        ergebnis.konfiguration.stilToSchwimmerZeiten[startBelegung.stil]
            ?: error("Keine Zeiten für Stil ${startBelegung.stil} gefunden")

    val neuerName =
        schwimmerZeiten
            .filter { it.name != auszutauschenderName }
            .random()
            .name

    val neueStartBelegungen =
        staffelBelegung.startBelegungen.replace(startBelegungenIndex, SchwimmerStil(neuerName, startBelegung.stil))
    val neueStaffelBelegungen =
        team.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))
    val neuesTeam =
        ergebnis.teams.replace(teamIndex, team.copy(staffelBelegungen = neueStaffelBelegungen))

    return Pair(Ergebnis(neuesTeam, ergebnis.konfiguration), 1)
}

fun mutateSmart(ergebnis: Ergebnis): Pair<Ergebnis, Int> {
    val result = mutableListOf<Ergebnis>()

    for (teamIndex in ergebnis.teams.indices) {
        val team = ergebnis.teams[teamIndex]

        for (staffelBelegungenIndex in team.staffelBelegungen.indices) {
            val staffelBelegung = team.staffelBelegungen[staffelBelegungenIndex]

            for (startBelegungenIndex in staffelBelegung.startBelegungen.indices) {
                val startBelegung = staffelBelegung.startBelegungen[startBelegungenIndex]

                val auszutauschenderName = startBelegung.name
                val schwimmerZeiten =
                    ergebnis.konfiguration.stilToSchwimmerZeiten[startBelegung.stil]
                        ?: error("Keine Zeiten für Stil ${startBelegung.stil} gefunden")

                val neuerName =
                    schwimmerZeiten
                        .filter { it.name != auszutauschenderName }
                        .random()
                        .name

                val neueStartBelegungen =
                    staffelBelegung.startBelegungen.replace(startBelegungenIndex, SchwimmerStil(neuerName, startBelegung.stil))
                val neueStaffelBelegungen =
                    team.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))
                val neuesTeam =
                    ergebnis.teams.replace(teamIndex, team.copy(staffelBelegungen = neueStaffelBelegungen))

                result.add(Ergebnis(neuesTeam, ergebnis.konfiguration))
            }
        }
    }

    return Pair(result.minBy { it.score }, result.size)
}

fun mutateVerySmart(ergebnis: Ergebnis): Pair<Ergebnis, Int> {
    val result = mutableListOf<Ergebnis>()

    for (teamIndex in ergebnis.teams.indices) {
        val team = ergebnis.teams[teamIndex]

        for (staffelBelegungenIndex in team.staffelBelegungen.indices) {
            val staffelBelegung = team.staffelBelegungen[staffelBelegungenIndex]

            for (startBelegungenIndex in staffelBelegung.startBelegungen.indices) {
                val startBelegung = staffelBelegung.startBelegungen[startBelegungenIndex]

                val auszutauschenderName = startBelegung.name
                val schwimmerZeiten =
                    ergebnis.konfiguration.stilToSchwimmerZeiten[startBelegung.stil]
                        ?: error("Keine Zeiten für Stil ${startBelegung.stil} gefunden")

                for (name in schwimmerZeiten.filter { it.name != auszutauschenderName }.map { it.name }) {
                    val neueStartBelegungen =
                        staffelBelegung.startBelegungen.replace(startBelegungenIndex, SchwimmerStil(name, startBelegung.stil))
                    val neueStaffelBelegungen =
                        team.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))
                    val neuesTeam =
                        ergebnis.teams.replace(teamIndex, team.copy(staffelBelegungen = neueStaffelBelegungen))

                    result.add(Ergebnis(neuesTeam, ergebnis.konfiguration))
                }
            }
        }
    }

    return Pair(result.minBy { it.score }, result.size)
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
                timeout = 5.seconds,
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
