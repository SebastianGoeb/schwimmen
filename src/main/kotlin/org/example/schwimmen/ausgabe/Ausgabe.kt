package org.example.schwimmen.ausgabe

import org.example.schwimmen.suche.Ergebnis
import java.text.DecimalFormat
import kotlin.time.Duration

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

        println("Team-Gesamtzeit: ${team.gesamtZeit}")
        println(LINE)
    }

    println(ergebnis.prettyStartsProSchwimmer())
    println(LINE)

    ergebnis.konfiguration.staffeln.forEachIndexed { index, staffel ->
        val zeiten = ergebnis.teams.map { it.staffelBelegungen[index].gesamtZeit }
        println("Staffelzeiten: ${zeiten.joinToString()} (Spanne: ${zeiten.max() - zeiten.min()}) ${staffel.name}")
    }
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
    if (ergebnis.konfiguration.anzahlTeams > 1) {
        println(
            "Zeitspanne pro Staffel < ${ergebnis.konfiguration.maxZeitspanneProStaffel}: ${if (ergebnis.zeitspanneViolations == 0) "✅" else "❌"}",
        )
    }
    println("Erfüllt alle Bedingungen: ${if (ergebnis.valide) "✅" else "❌"}")
    println("Geprüfte Konstellationen: ${DecimalFormat("#,###").format(statesChecked)}")
}
