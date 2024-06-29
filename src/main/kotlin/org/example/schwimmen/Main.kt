package org.example.schwimmen

import org.example.schwimmen.ausgabe.printErgebnis
import org.example.schwimmen.eingabe.STAFFELN
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
        maxGenerations = 10_000_000,
    )

private fun loadFJugend(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        maxStartsProSchwimmer = 5,
        anzahlTeams = 1,
        maxZeitspanneProStaffel = 1.seconds,
        staffeln = STAFFELN,
        schwimmerList = parseStilZeiten(File("src/main/resources/f_jugend/zeiten.tsv").readText()),
        geschlechtFJugend,
    )

private fun loadEJugend(): Konfiguration =
    Konfiguration(
        alleMuessenSchwimmen = true,
        minSchwimmerProTeam = 7,
        maxSchwimmerProTeam = 12,
        minMaleProTeam = 2,
        minFemaleProTeam = 2,
        maxStartsProSchwimmer = 5,
        anzahlTeams = 2,
        maxZeitspanneProStaffel = 1.seconds,
        staffeln = STAFFELN,
        schwimmerList = parseStilZeiten(File("src/main/resources/e_jugend/zeiten.tsv").readText()),
        geschlechtEJugend,
    )

fun main() {
    val konfiguration = loadEJugend()
    if (!konfiguration.valid()) {
        exitProcess(1)
    }

    val (staffelErgebnis, duration, statesChecked) = runCrappySimulatedAnnealing(konfiguration, HYPERPARAMETERS)

    printErgebnis(staffelErgebnis, duration, statesChecked)
}
