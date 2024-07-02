package org.example.schwimmen

import org.example.schwimmen.ausgabe.printErgebnis
import org.example.schwimmen.eingabe.STAFFELN
import org.example.schwimmen.eingabe.abwesenheitenEJugendMitOskar
import org.example.schwimmen.eingabe.abwesenheitenEJugendOhneOskar
import org.example.schwimmen.eingabe.abwesenheitenFJugend
import org.example.schwimmen.eingabe.geschlechtEJugend
import org.example.schwimmen.eingabe.geschlechtFJugend
import org.example.schwimmen.eingabe.maxStartsProSchwimmer
import org.example.schwimmen.eingabe.minStartsProSchwimmer
import org.example.schwimmen.eingabe.parseStilZeiten
import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.search.ga.crossover.OnePointAnywhereCrossover
import org.example.schwimmen.search.ga.selection.TournamentSelection
import org.example.schwimmen.search.sa.Hyperparameters
import org.example.schwimmen.search.sa.mutateHeuristically
import org.example.schwimmen.search.sa.mutateRandom
import org.example.schwimmen.search.sa.mutateVerySmart
import org.example.schwimmen.search.sa.runCrappySimulatedAnnealing
import java.io.File
import kotlin.system.exitProcess
import kotlin.time.Duration.Companion.seconds

val CSA_HYPERPARAMETERS =
    Hyperparameters(
        smartMutationRate = 0.85,
        smartMutation = ::mutateVerySmart,
        dumbMutation = ::mutateHeuristically,
        acceptanceProbability = 0.1,
        globalGenerationLimit = 100,
        restartGenerationLimit = 50,
        maxGenerations = 1_000_000,
        100,
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
val maxZeitspanneProTeam = 3.seconds

private fun loadFJugend(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        minStartsProSchwimmer = minStartsProSchwimmer,
        minStartsProSchwimmerDefault = 0,
        maxStartsProSchwimmer = maxStartsProSchwimmer,
        maxStartsProSchwimmerDefault = 5,
        anzahlTeams = 1,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/f_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenFJugend.contains(it.name) },
        geschlecht = geschlechtFJugend.filterKeys { !abwesenheitenFJugend.contains(it) },
    )

private fun loadEJugendOhneOskar(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        minStartsProSchwimmer = minStartsProSchwimmer,
        minStartsProSchwimmerDefault = 0,
        maxStartsProSchwimmer = maxStartsProSchwimmer,
        maxStartsProSchwimmerDefault = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/e_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenEJugendOhneOskar.contains(it.name) },
        geschlecht = geschlechtEJugend.filterKeys { !abwesenheitenEJugendOhneOskar.contains(it) },
    )

private fun loadEJugendMitOskar(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        minStartsProSchwimmer = minStartsProSchwimmer,
        minStartsProSchwimmerDefault = 0,
        maxStartsProSchwimmer = maxStartsProSchwimmer,
        maxStartsProSchwimmerDefault = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/e_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenEJugendMitOskar.contains(it.name) },
        geschlecht = geschlechtEJugend.filterKeys { !abwesenheitenEJugendMitOskar.contains(it) },
    )

fun main() {
    val konfiguration = loadEJugendMitOskar()
    if (!konfiguration.valid()) {
        exitProcess(1)
    }

    val (staffelErgebnis, duration, statesChecked) = runCrappySimulatedAnnealing(konfiguration, CSA_HYPERPARAMETERS)

    printErgebnis(staffelErgebnis, duration, statesChecked)
}
