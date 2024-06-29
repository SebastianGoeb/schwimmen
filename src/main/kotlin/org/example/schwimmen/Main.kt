package org.example.schwimmen

import org.example.schwimmen.ausgabe.printErgebnis
import org.example.schwimmen.eingabe.STAFFELN
import org.example.schwimmen.eingabe.abwesenheitenEJugendMitOskar
import org.example.schwimmen.eingabe.abwesenheitenEJugendOhneOskar
import org.example.schwimmen.eingabe.abwesenheitenFJugend
import org.example.schwimmen.eingabe.geschlechtEJugend
import org.example.schwimmen.eingabe.geschlechtFJugend
import org.example.schwimmen.eingabe.parseStilZeiten
import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.search.Hyperparameters
import org.example.schwimmen.search.mutateRandom
import org.example.schwimmen.search.mutateVerySmart
import org.example.schwimmen.search.runCrappySimulatedAnnealing
import java.io.File
import kotlin.system.exitProcess
import kotlin.time.Duration.Companion.seconds

val HYPERPARAMETERS =
    Hyperparameters(
        smartMutationRate = 0.85,
        smartMutation = ::mutateVerySmart,
        dumbMutation = ::mutateRandom,
        timeout = 5.seconds,
        maxGenerations = 1_000_000,
        32,
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
        maxStartsProSchwimmer = 5,
        anzahlTeams = 1,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/f_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenFJugend.contains(it.name) },
        geschlechtFJugend.filterKeys { !abwesenheitenFJugend.contains(it) },
    )

private fun loadEJugendOhneOskar(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        maxStartsProSchwimmer = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/e_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenEJugendOhneOskar.contains(it.name) },
        geschlechtEJugend.filterKeys { !abwesenheitenEJugendOhneOskar.contains(it) },
    )

private fun loadEJugendMitOskar(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        maxStartsProSchwimmer = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = maxZeitspanneProStaffel,
        staffeln = STAFFELN,
        schwimmerList =
            parseStilZeiten(File("src/main/resources/e_jugend/zeiten.tsv").readText())
                .filter { !abwesenheitenEJugendMitOskar.contains(it.name) },
        geschlechtEJugend.filterKeys { !abwesenheitenEJugendMitOskar.contains(it) },
    )

fun main() {
    val konfiguration = loadEJugendOhneOskar()
    if (!konfiguration.valid()) {
        exitProcess(1)
    }

    val (staffelErgebnis, duration, statesChecked) = runCrappySimulatedAnnealing(konfiguration, HYPERPARAMETERS)

    printErgebnis(staffelErgebnis, duration, statesChecked)
}
