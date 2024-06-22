package org.example.schwimmen

import org.example.schwimmen.konfiguration.Konfiguration
import org.example.schwimmen.konfiguration.SchwimmerStil
import org.example.schwimmen.konfiguration.Staffel
import org.example.schwimmen.konfiguration.StilStarts
import org.example.schwimmen.suche.Ergebnis
import org.example.schwimmen.suche.StaffelBelegung
import org.example.schwimmen.util.parseTimes

const val MAX_GENERATIONS = 10_000_000

val staffeln =
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

fun main() {
    val schwimmerList = parseTimes("src/main/resources/data_enriched.tsv")
    val konfiguration =
        Konfiguration(
            minSchwimmer = 7,
            maxSchwimmer = 12,
            maxStartsProSchwimmer = 5,
            staffeln = staffeln,
            schwimmerList = schwimmerList,
        )

    val staffelErgebnis = optimize(konfiguration, staffeln)

    staffelErgebnis.staffelBelegungen.forEach {
        println(it.toPrettyString())
        println()
    }

    println(staffelErgebnis.prettyGesamtAuslastung())
    println()

    println("Gesamtzeit: ${staffelErgebnis.gesamtZeit}")
    println("Erfüllt alle Bedingungen: ${if (staffelErgebnis.valide) "ja ✅" else "nein ❌"}")
}

fun optimize(
    konfiguration: Konfiguration,
    staffeln: List<Staffel>,
): Ergebnis {
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
    println(ergebnis.score)

    // dann schwimmer austauschen bis max starts eingehalten sind
    println("Best score")
    for (i in 1..MAX_GENERATIONS) {
        ergebnis = mutateRandom(ergebnis)

        if (ergebnis.score < bestErgebnis.score) {
            bestErgebnis = ergebnis
            println("${ergebnis.score} (gen $i)")
        }
    }
    println()

    return bestErgebnis
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

fun <E> List<E>.replace(
    index: Int,
    newElement: E,
): List<E> {
    require(index < this.size)
    return this.mapIndexed { i, e -> if (i == index) newElement else e }
}
