package org.example.schwimmen

import org.example.schwimmen.ausgabe.printErgebnis
import org.example.schwimmen.eingabe.Geschlecht
import org.example.schwimmen.eingabe.parseAbwesenheiten
import org.example.schwimmen.eingabe.parseGeschlechter
import org.example.schwimmen.eingabe.parseMinMax
import org.example.schwimmen.eingabe.parseStaffeln
import org.example.schwimmen.eingabe.parseStilZeiten
import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.Schwimmer
import org.example.schwimmen.search.State
import org.example.schwimmen.search.ga.crossover.OnePointAnywhereCrossover
import org.example.schwimmen.search.ga.selection.TournamentSelection
import org.example.schwimmen.search.sa.Hyperparameters
import org.example.schwimmen.search.sa.mutateHeuristically
import org.example.schwimmen.search.sa.mutateRandom
import org.example.schwimmen.search.sa.mutateVerySmart
import org.example.schwimmen.search.sa.runCrappySimulatedAnnealing
import java.io.File
import java.util.Locale.UK
import kotlin.math.roundToInt
import kotlin.system.exitProcess
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit.MINUTES
import kotlin.time.DurationUnit.SECONDS

val CSA_HYPERPARAMETERS =
    Hyperparameters(
        smartMutationRate = 0.85,
        smartMutation = ::mutateVerySmart,
        dumbMutation = ::mutateHeuristically,
        acceptanceProbability = 0.1,
        globalGenerationLimit = 100,
        restartGenerationLimit = 50,
        maxGenerations = 1_000_000,
        20,
    )
val GA_HYPERPARAMETERS =
    org.example.schwimmen.search.ga.Hyperparameters(
        numElites = 1,
        selection = TournamentSelection(3, withReplacement = true)::selectParents,
        crossoverProbability = 0.6,
        crossover = OnePointAnywhereCrossover()::crossover,
        mutationProbability = 0.01,
        mutate = { mutateRandom(it).first },
        timeout = 10.seconds,
        maxGenerations = 1_000_000,
        100,
    )

val maxZeitspanneProStaffel = 1.seconds

private fun loadFJugend(): Konfiguration {
    val abwesenheiten = parseAbwesenheiten(File("src/main/resources/abwesenheiten_f.tsv").readText())
    return Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        minMax = parseMinMax(File("src/main/resources/min_max.tsv").readText()),
        minDefault = 0,
        maxDefault = 5,
        anzahlTeams = 1,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = staffeln(),
        schwimmerList = zeiten("src/main/resources/f_jugend/zeiten.tsv").filter { !abwesenheiten.contains(it.name) },
        geschlecht = geschlecht("src/main/resources/geschlecht_f.tsv").filterKeys { !abwesenheiten.contains(it) },
    )
}

private fun loadEJugend(): Konfiguration {
    val abwesenheiten = parseAbwesenheiten(File("src/main/resources/abwesenheiten_e.tsv").readText())
    return Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        minMax = parseMinMax(File("src/main/resources/min_max.tsv").readText()),
        minDefault = 0,
        maxDefault = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = staffeln(),
        schwimmerList = zeiten("src/main/resources/e_jugend/zeiten.tsv").filter { !abwesenheiten.contains(it.name) },
        geschlecht = geschlecht("src/main/resources/geschlecht_e.tsv").filterKeys { !abwesenheiten.contains(it) },
    )
}

private fun zeiten(file: String): List<Schwimmer> = parseStilZeiten(File(file).readText())

private fun staffeln() = parseStaffeln(File("src/main/resources/staffeln.tsv").readText())

private fun geschlecht(file: String): Map<String, Geschlecht> = parseGeschlechter(File(file).readText())

fun main() {
    val konfiguration = loadEJugend()
    if (!konfiguration.valid()) {
        exitProcess(1)
    }

//    runExperiment(konfiguration)
    runOnce(konfiguration)
}

private fun runOnce(konfiguration: Konfiguration) {
    val (staffelErgebnis, duration, statesChecked) = runCrappySimulatedAnnealing(konfiguration, CSA_HYPERPARAMETERS)
    printErgebnis(staffelErgebnis, duration, statesChecked)
}

private fun runExperiment(konfiguration: Konfiguration) {
    println(
        listOf(
            "popsize",
            "restarts",
            "avgScore",
            "bestScore",
            "avgTime",
            "bestTime",
            "avgStatesPerSecond",
        ).joinToString("\t"),
    )

    for (popsize in listOf(30, 40, 50, 60, 70, 80)) {
        for (i in (1..5)) {
            val restarts = i * 20 - 10

            val results: List<Triple<State, Duration, Int>> =
                (1..7).map {
                    runCrappySimulatedAnnealing(
                        konfiguration,
                        CSA_HYPERPARAMETERS.copy(
                            populationSize = popsize,
                            restartGenerationLimit = restarts,
                        ),
                        printProgress = false,
                    )
                }
            val scores = results.map { it.first.score.toDouble(MINUTES) }
            val avgScore = scores.average()
            val bestScore = scores.min()

            val avgTime = results.map { it.second.toDouble(SECONDS) }.average()
            val bestTime = results.map { it.second.toDouble(SECONDS) }.min()

            val avgStatesPerSecond = results.map { (it.third / it.second.toDouble(SECONDS)).roundToInt() }.average()

            println(
                listOf(
                    popsize,
                    restarts,
                    "%.1f".format(UK, avgScore),
                    "%.1f".format(UK, bestScore),
                    "%.1f".format(UK, avgTime),
                    "%.1f".format(UK, bestTime),
                    "%.0f".format(UK, avgStatesPerSecond),
                ).joinToString("\t"),
            )
        }
    }
}
