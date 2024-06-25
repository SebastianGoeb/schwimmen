package org.example.schwimmen.suche

import org.example.schwimmen.konfiguration.Konfiguration
import org.example.schwimmen.konfiguration.SchwimmerStil
import org.example.schwimmen.konfiguration.Staffel
import kotlin.math.max
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

val stilThenName = compareBy<SchwimmerStil> { it.stil }.thenBy { it.name }
val strafMinutenProRegelverstoss = 5.minutes

data class StaffelBelegung(
    val staffel: Staffel,
    val konfiguration: Konfiguration,
    val startBelegungen: List<SchwimmerStil>,
) {
    val gesamtZeit: Duration by lazy {
        val zeiten =
            startBelegungen
                .map { zuweisung ->
                    val schwimmerZeiten =
                        konfiguration.stilToSchwimmerToZeit[zuweisung.stil] ?: error("Programmierfehler")
                    schwimmerZeiten[zuweisung.name] ?: error("Programmierfehler")
                }
        if (staffel.team) {
            zeiten.max()
        } else {
            zeiten.reduce(Duration::plus)
        }
    }

    val score: Duration by lazy {
        val maxStartsProSchwimmerProStaffel = 1
        val anzahlDoppelbelegungen =
            startBelegungen
                .groupBy { it.name }
                .map { it.value.size - maxStartsProSchwimmerProStaffel }
                .sum()
        gesamtZeit + (strafMinutenProRegelverstoss * anzahlDoppelbelegungen)
    }

    fun toPrettyString(): String {
        val schwimmerZeilen =
            startBelegungen
                .sortedWith(stilThenName)
                .joinToString("\n") { zuweisung ->
                    val schwimmerZeiten = konfiguration.stilToSchwimmerToZeit[zuweisung.stil] ?: error("Programmierfehler")
                    val zeit = schwimmerZeiten[zuweisung.name] ?: error("Programmierfehler")
                    "${zuweisung.stil}: ${zuweisung.name} ($zeit)"
                }
        return """
Staffel: ${staffel.name}
$schwimmerZeilen
Gesamtzeit: $gesamtZeit
            """.trimIndent()
    }
}

data class Ergebnis(
    val staffelBelegungen: List<StaffelBelegung>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit: Duration by lazy { staffelBelegungen.map { it.gesamtZeit }.reduce(Duration::plus) }

    val score: Duration by lazy {
        val staffelBelegungenScore = staffelBelegungen.map { it.score }.reduce(Duration::plus)

        val anzahlSchwimmer = gesamtAuslastung.size
        val minSchwimmerPenalty = strafMinutenProRegelverstoss * max(konfiguration.resolvedMinSchwimmer - anzahlSchwimmer, 0)
        val maxSchwimmerPenalty = strafMinutenProRegelverstoss * max(anzahlSchwimmer - konfiguration.maxSchwimmer, 0)

        val maxStartsProSchwimmerPenalty =
            strafMinutenProRegelverstoss *
                gesamtAuslastung
                    .map { max(it.value - konfiguration.maxStartsProSchwimmer, 0) }
                    .sum()

        staffelBelegungenScore +
            minSchwimmerPenalty +
            maxSchwimmerPenalty +
            maxStartsProSchwimmerPenalty
    }

    val gesamtAuslastung: MutableMap<String, Int> by lazy {
        val auslastung = mutableMapOf<String, Int>()
        staffelBelegungen.forEach { staffelErgebnis ->
            staffelErgebnis.startBelegungen.forEach {
                auslastung[it.name] = (auslastung[it.name] ?: 0) + 1
            }
        }
        auslastung
    }

    val valide: Boolean by lazy { gesamtZeit == score }

    fun prettyGesamtAuslastung(): String =
        """
Gesamtauslastung
${gesamtAuslastung.toSortedMap().map { "${it.key} x${it.value}" }.joinToString("\n")}
        """.trimIndent()
}
