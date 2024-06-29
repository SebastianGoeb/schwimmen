package org.example.schwimmen.ausgabe

import org.example.schwimmen.search.Ergebnis
import org.example.schwimmen.util.formatZeit
import java.text.DecimalFormat
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt
import kotlin.time.Duration
import kotlin.time.DurationUnit.SECONDS
import kotlin.time.toJavaDuration
import kotlin.time.toKotlinDuration

private const val LINE = "--------------------------------"

fun printErgebnis(
    ergebnis: Ergebnis,
    duration: Duration,
    statesChecked: Int,
) {
    for (team in ergebnis.teams) {
        println(team.name)
        team.staffelBelegungen.forEach {
            println(it.toPrettyString())
            println()
        }

        println("Team-Gesamtzeit: ${formatZeit(team.gesamtZeit)}")
        println()
    }

    println(ergebnis.prettyStartsProSchwimmer())
    println(LINE)

    ergebnis.konfiguration.staffeln.forEachIndexed { index, staffel ->
        val zeiten = ergebnis.teams.map { it.staffelBelegungen[index].gesamtZeit }
        println("Staffelzeiten: ${zeiten.joinToString{ formatZeit(it) }} (Spanne: ${zeiten.max() - zeiten.min()}) ${staffel.name}")
    }
    println(LINE)

    ergebnis.teams.forEach { println("${it.name}-Gesamtzeit: ${formatZeit(it.gesamtZeit)}") }
    println("Insgesamt-Gesamtzeit: ${formatZeit(ergebnis.gesamtZeit)}")
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
    if (ergebnis.konfiguration.anzahlTeams > 1) {
        println(
            "Zeitspanne pro Staffel < ${ergebnis.konfiguration.maxZeitspanneProStaffel}: ${if (ergebnis.zeitspanneViolations == 0) "✅" else "❌"}",
        )
    }
    println("Erfüllt alle Bedingungen: ${if (ergebnis.valide) "✅" else "❌"}")

    val statesFormatted = DecimalFormat("#,###").format(statesChecked)
    val durationTruncated = duration.toJavaDuration().truncatedTo(ChronoUnit.SECONDS).toKotlinDuration()
    val statesPerSecondFormatted = DecimalFormat("#,###").format((statesChecked / duration.toDouble(SECONDS)).roundToInt())
    println(
        "Geprüfte Konstellationen: $statesFormatted in $durationTruncated ($statesPerSecondFormatted/s)",
    )
}
