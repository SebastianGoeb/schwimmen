package org.example.schwimmen

import org.example.schwimmen.konfiguration.Hyperparameters
import org.example.schwimmen.konfiguration.Konfiguration
import org.example.schwimmen.konfiguration.Schwimmer
import org.example.schwimmen.konfiguration.SchwimmerStil
import org.example.schwimmen.konfiguration.Staffel
import org.example.schwimmen.konfiguration.StilStarts
import org.example.schwimmen.parser.parseTimesFromTallTable
import org.example.schwimmen.suche.Ergebnis
import org.example.schwimmen.suche.StaffelBelegung
import org.example.schwimmen.suche.Team
import org.example.schwimmen.util.convertTallToWide
import java.io.File
import kotlin.math.round
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit.MILLISECONDS
import kotlin.time.TimeSource.Monotonic.markNow

private const val MAX_GENERATIONS = 10_000_000
private const val LINE = "--------------------------------"

val staffelnWide =
    listOf(
        Staffel(listOf(StilStarts("Kraul", 4)), false),
        Staffel(listOf(StilStarts("25m BrAr/KrBei", 4)), false),
        Staffel(listOf(StilStarts("Brust", 4)), false),
        Staffel(
            listOf(
                StilStarts("Rücken Beine", 2),
                StilStarts("Brust Beine", 2),
                StilStarts("Kraul Beine", 2),
            ),
            false,
        ),
        Staffel(listOf(StilStarts("Rücken", 4)), false),
        Staffel(listOf(StilStarts("200m Team", 4)), true),
        Staffel(
            listOf(
                StilStarts("Rücken", 2),
                StilStarts("Brust", 2),
                StilStarts("Kraul", 2),
            ),
            false,
        ),
    )

val staffelnTall =
    listOf(
        Staffel(listOf(StilStarts("25m Kraul", 4)), false),
        Staffel(listOf(StilStarts("25m BrAr/KrBei", 4)), false),
        Staffel(listOf(StilStarts("25m Brust", 4)), false),
        Staffel(
            listOf(
                StilStarts("25m Rücken Beine", 2),
                StilStarts("25m Brust Beine", 2),
                StilStarts("25m Kraul Beine", 2),
            ),
            false,
        ),
        Staffel(listOf(StilStarts("25m Rücken", 4)), false),
        Staffel(listOf(StilStarts("200m Team", 4)), true),
        Staffel(
            listOf(
                StilStarts("25m Rücken", 2),
                StilStarts("25m Brust", 2),
                StilStarts("25m Kraul", 2),
            ),
            false,
        ),
    )

fun main() {
    runOnce()
}

private fun runOnce() {
    val schwimmerList = loadFJugend()
    val konfiguration =
        Konfiguration(
            alleMuessenSchwimmen = true,
            minSchwimmerProTeam = 7,
            maxSchwimmerProTeam = 12,
            maxStartsProSchwimmer = 5,
            staffeln = staffelnTall,
            anzahlTeams = 1,
            teamsMoeglichstGleich = true, // irrelevant für nur 1 team
            schwimmerList = schwimmerList,
        )

    val (staffelErgebnis, _) =
        optimize(
            konfiguration,
            staffelnTall,
            Hyperparameters(
                smartMutationRate = 0.85,
                smartMutation = ::mutateVerySmart,
                dumbMutation = ::mutateRandom,
                timeout = 60.seconds,
            ),
        )

    printErgebnis(staffelErgebnis)
}

private fun optimizeHyperparameters() {
    val schwimmerList = loadFJugend()
    val konfiguration =
        Konfiguration(
            alleMuessenSchwimmen = true,
            minSchwimmerProTeam = 7,
            maxSchwimmerProTeam = 12,
            maxStartsProSchwimmer = 5,
            staffeln = staffelnTall,
            anzahlTeams = 1,
            teamsMoeglichstGleich = true, // irrelevant für nur 1 team
            schwimmerList = schwimmerList,
        )

    val start = 0.5
    val end = 1
    val steps = 20
    val hyperparametersList =
        (0..steps).map {
            Hyperparameters(
                smartMutationRate = start * (1 - it / steps.toDouble()) + end * (it / steps.toDouble()),
                smartMutation = ::mutateVerySmart,
                dumbMutation = ::mutateRandom,
                timeout = 1.seconds,
            )
        }

    // warmup
    (1..20)
        .toList()
        .parallelStream()
        .forEach { optimize(konfiguration, staffelnTall, hyperparametersList.random(), printProgress = false) }

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

private fun loadFJugend(): List<Schwimmer> {
    val file = File("src/main/resources/jugend_f_zeiten.tsv")
    val schwimmerZeiten = parseTimesFromTallTable(file.readText())
    return convertTallToWide(schwimmerZeiten)
}

private fun loadEJugend(): List<Schwimmer> {
    val file = File("src/main/resources/jugend_e_zeiten.tsv")
    val schwimmerZeiten = parseTimesFromTallTable(file.readText())
    return convertTallToWide(schwimmerZeiten)
}

private fun runHyperparameterExperiment(
    konfiguration: Konfiguration,
    hyperparameters: Hyperparameters,
): ExperimentResult {
    // benchmark
    val runs = 10
    val results = (1..runs).map { optimize(konfiguration, staffelnWide, hyperparameters, printProgress = false) }
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

fun optimize(
    konfiguration: Konfiguration,
    staffeln: List<Staffel>,
    hyperparameters: Hyperparameters,
    printProgress: Boolean = true,
): Pair<Ergebnis, Duration> {
    val start = markNow()

    // erstmal optimal zuweisen, und alle einschränkungen ignorieren
    val staffelZuweisungen = initialRandomAssignment(konfiguration)

    var ergebnis = Ergebnis(staffelZuweisungen, konfiguration)
    var bestErgebnis = ergebnis
    var timeToBestErgebnis = markNow() - start

    // dann schwimmer austauschen bis max starts eingehalten sind
    if (printProgress) {
        println("Score progress")
    }
    for (i in 0..<MAX_GENERATIONS) {
        ergebnis =
            if (Random.nextDouble() < hyperparameters.smartMutationRate) {
                hyperparameters.smartMutation(ergebnis)
            } else {
                hyperparameters.dumbMutation(ergebnis)
            }

        if (ergebnis.score < bestErgebnis.score) {
            bestErgebnis = ergebnis
            timeToBestErgebnis = markNow() - start
            if (printProgress) {
                println("${ergebnis.score} ${if (ergebnis.valide) "✓" else "✗"} (gen $i)")
            }
        }

        if (markNow() > start + hyperparameters.timeout) {
            break
        }
    }
    if (printProgress) {
        println()
    }

    return Pair(bestErgebnis, timeToBestErgebnis)
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

fun mutateRandom(ergebnis: Ergebnis): Ergebnis {
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

    return Ergebnis(neuesTeam, ergebnis.konfiguration)
}

fun mutateSmart(ergebnis: Ergebnis): Ergebnis {
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

    return result.minBy { it.score }
}

fun mutateVerySmart(ergebnis: Ergebnis): Ergebnis {
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

    return result.minBy { it.score }
}

fun <E> List<E>.replace(
    index: Int,
    newElement: E,
): List<E> {
    require(index < this.size)
    return this.mapIndexed { i, e -> if (i == index) newElement else e }
}

fun scoreBar(
    score: Double,
    maxScore: Double,
    maxWidth: Int = 20,
    barChar: Char = '-',
    pointChar: Char = 'o',
): String {
    val numChars = round(score / maxScore * maxWidth).toInt()
    return "${barChar.toString().repeat(numChars - 1)}$pointChar (${"%.2f".format(score)})"
}

private fun printErgebnis(ergebnis: Ergebnis) {
    for (team in ergebnis.teams) {
        println(team.name)
        team.staffelBelegungen.forEach {
            println(it.toPrettyString())
            println()
        }

        println("Team-Gesamtzeit: ${team.gesamtZeit}")
        println(LINE)
    }

    println(ergebnis.prettyStartsProSchwimmer())
    println(LINE)

    ergebnis.teams.forEach { println("${it.name}-Gesamtzeit: ${it.gesamtZeit}") }
    println("Insgesamt-Gesamtzeit: ${ergebnis.gesamtZeit}")
    println(LINE)

    println(
        "Max Starts pro Schwimmer <= ${ergebnis.konfiguration.maxStartsProSchwimmer}: ${if (ergebnis.maxStartsProSchwimmerViolations == 0) "✅" else "❌"}",
    )
    println("Schwimmer nicht in mehreren Teams: ${if (ergebnis.schwimmerInMehrerenTeamsViolations == 0) "✅" else "❌"}")
    if (ergebnis.schwimmerInMehrerenTeamsViolations > 0) {
        (
            println("Schwimmer in mehreren Teams: ${ergebnis.schwimmerInMehrerenTeams}")
        )
    }
    if (ergebnis.konfiguration.alleMuessenSchwimmen) {
        println("Alle müssen schwimmen: ${if (ergebnis.alleMuessenSchwimmenViolations == 0) "✅" else "❌"}")
    }
    println("Erfüllt alle Bedingungen: ${if (ergebnis.valide) "✅" else "❌"}")
}
