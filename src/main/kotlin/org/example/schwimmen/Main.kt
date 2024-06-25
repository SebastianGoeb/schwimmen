package org.example.schwimmen

import org.example.schwimmen.konfiguration.Hyperparameters
import org.example.schwimmen.konfiguration.Konfiguration
import org.example.schwimmen.konfiguration.Schwimmer
import org.example.schwimmen.konfiguration.SchwimmerStil
import org.example.schwimmen.konfiguration.Staffel
import org.example.schwimmen.konfiguration.StilStarts
import org.example.schwimmen.parser.parseTimesFromTallTable
import org.example.schwimmen.parser.parseTimesFromWideTable
import org.example.schwimmen.suche.Ergebnis
import org.example.schwimmen.suche.StaffelBelegung
import org.example.schwimmen.util.convertTallToWide
import java.io.File
import kotlin.math.round
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit.MILLISECONDS
import kotlin.time.TimeSource.Monotonic.markNow

const val MAX_GENERATIONS = 10_000_000

val staffelnWide =
    listOf(
        Staffel(listOf(StilStarts("Kraul", 4)), false),
        Staffel(listOf(StilStarts("Kombi", 4)), false),
        Staffel(listOf(StilStarts("Brust", 4)), false),
        Staffel(
            listOf(
                StilStarts("Rücken-Beine", 2),
                StilStarts("Brust-Beine", 2),
                StilStarts("Kraul-Beine", 2),
            ),
            false,
        ),
        Staffel(listOf(StilStarts("Rücken", 4)), false),
        Staffel(listOf(StilStarts("200 Team", 4)), true),
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
                StilStarts("25m R-Beine", 2),
                StilStarts("25m Brust Beine", 2),
                StilStarts("25m K-Beine", 2),
            ),
            false,
        ),
        Staffel(listOf(StilStarts("25m Rücken", 4)), false),
        Staffel(listOf(StilStarts("200 Team", 4)), true),
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
    val schwimmerList = loadTall()
    val konfiguration =
        Konfiguration(
            alleMuessenSchwimmen = true,
            minSchwimmer = 7,
            maxSchwimmer = 12,
            maxStartsProSchwimmer = 5,
            staffeln = staffelnTall,
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
                timeout = 5.seconds,
            ),
        )

    printErgebnis(staffelErgebnis)
}

private fun optimizeHyperparameters() {
    val schwimmerList = loadTall()
    val konfiguration =
        Konfiguration(
            alleMuessenSchwimmen = true,
            minSchwimmer = 7,
            maxSchwimmer = 12,
            maxStartsProSchwimmer = 5,
            staffeln = staffelnTall,
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

private fun loadWide(): List<Schwimmer> {
    val file = File("src/main/resources/data_enriched.tsv")
    return parseTimesFromWideTable(file.readText())
}

private fun loadTall(): List<Schwimmer> {
    val file = File("src/main/resources/jugend_f_zeiten.tsv")
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
    val staffelZuweisungen =
        staffeln.map { staffel ->
            val zuweisungen: List<SchwimmerStil> =
                staffel.stileAnzahl.flatMap { (stil, anzahl) ->
                    val schwimmerZeiten = konfiguration.stilToSchwimmerZeiten[stil] ?: error("Keine Zeiten für Stil $stil gefunden")
                    schwimmerZeiten.take(anzahl).map { SchwimmerStil(it.name, stil) }
                }
            StaffelBelegung(staffel, konfiguration, zuweisungen)
        }

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

fun mutateRandom(ergebnis: Ergebnis): Ergebnis {
    val staffelBelegungenIndex = ergebnis.staffelBelegungen.indices.random()
    val staffelBelegung = ergebnis.staffelBelegungen[staffelBelegungenIndex]

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
        ergebnis.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))

    return Ergebnis(neueStaffelBelegungen, ergebnis.konfiguration)
}

fun mutateSmart(ergebnis: Ergebnis): Ergebnis {
    val result = mutableListOf<Ergebnis>()

    for (staffelBelegungenIndex in ergebnis.staffelBelegungen.indices) {
        val staffelBelegung = ergebnis.staffelBelegungen[staffelBelegungenIndex]

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
                ergebnis.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))

            result.add(Ergebnis(neueStaffelBelegungen, ergebnis.konfiguration))
        }
    }

    return result.minBy { it.score }
}

fun mutateVerySmart(ergebnis: Ergebnis): Ergebnis {
    val result = mutableListOf<Ergebnis>()

    for (staffelBelegungenIndex in ergebnis.staffelBelegungen.indices) {
        val staffelBelegung = ergebnis.staffelBelegungen[staffelBelegungenIndex]

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
                    ergebnis.staffelBelegungen.replace(staffelBelegungenIndex, staffelBelegung.copy(startBelegungen = neueStartBelegungen))

                result.add(Ergebnis(neueStaffelBelegungen, ergebnis.konfiguration))
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

private fun printErgebnis(staffelErgebnis: Ergebnis) {
    staffelErgebnis.staffelBelegungen.forEach {
        println(it.toPrettyString())
        println()
    }

    println(staffelErgebnis.prettyGesamtAuslastung())
    println()

    println("Gesamtzeit: ${staffelErgebnis.gesamtZeit}")
    println("Erfüllt alle Bedingungen: ${if (staffelErgebnis.valide) "ja ✅" else "nein ❌"}")
}
