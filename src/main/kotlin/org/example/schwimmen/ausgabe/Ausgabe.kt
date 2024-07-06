package org.example.schwimmen.ausgabe

import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.search.StaffelBelegung
import org.example.schwimmen.search.State
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
    state: State,
    duration: Duration,
    statesChecked: Int,
) {
    for (team in state.teams) {
        println(team.name)
        team.staffelBelegungen.forEach {
            println(staffelBelegungToPrettyString(state.konfiguration, it))
            println()
        }

        println("Team-Gesamtzeit: ${formatZeit(team.gesamtZeit)}")
        println()
    }

    println(prettyStartsProSchwimmer(state))
    println(LINE)

    state.konfiguration.staffeln.forEachIndexed { index, staffel ->
        val zeiten = state.teams.map { it.staffelBelegungen[index].gesamtZeit }
        println("Staffelzeiten: ${zeiten.joinToString{ formatZeit(it) }} (Spanne: ${zeiten.max() - zeiten.min()}) ${staffel.name}")
    }
    println(LINE)

    state.teams.forEach { println("${it.name}-Gesamtzeit: ${formatZeit(it.gesamtZeit)}") }
    println("Insgesamt-Gesamtzeit: ${formatZeit(state.gesamtZeit)}")
    println(LINE)

    println(
        "Max Starts pro Schwimmer <= max: ${if (state.maxStartsProSchwimmerViolations == 0) "✅" else "❌"}",
    )
    println("Schwimmer nicht in mehreren Teams: ${if (state.schwimmerInMehrerenTeamsViolations == 0) "✅" else "❌"}")
    if (state.schwimmerInMehrerenTeamsViolations > 0) {
        (
            println("Schwimmer in mehreren Teams: ${state.schwimmerInMehrerenTeams}")
        )
    }
    if (state.konfiguration.alleMuessenSchwimmen) {
        println("Alle müssen schwimmen: ${if (state.alleMuessenSchwimmenViolations == 0) "✅" else "❌"}")
    }
    if (state.konfiguration.anzahlTeams > 1) {
        println(
            "Zeitspanne pro Staffel < ${state.konfiguration.maxZeitspanneProStaffel}: ${if (state.zeitspannePenalty == Duration.ZERO) "✅" else "❌"}",
        )
    }
    println("Erfüllt alle Bedingungen: ${if (state.valide) "✅" else "❌"}")

    val statesFormatted = DecimalFormat("#,###").format(statesChecked)
    val durationTruncated = duration.toJavaDuration().truncatedTo(ChronoUnit.SECONDS).toKotlinDuration()
    val statesPerSecondFormatted = DecimalFormat("#,###").format((statesChecked / duration.toDouble(SECONDS)).roundToInt())
    println(
        "Geprüfte Konstellationen: $statesFormatted in $durationTruncated ($statesPerSecondFormatted/s)",
    )
}

fun prettyStartsProSchwimmer(state: State): String {
    val joinToString =
        state.startsProSchwimmer
            .mapIndexed { schwimmerId, starts -> Pair(state.konfiguration.schwimmerList[schwimmerId].name, starts) }
            .sortedBy { it.first }
            .joinToString("\n") { "${it.first}\t${it.second}" }
    return """
Anzahl Starts:
$joinToString
        """.trimIndent()
}

fun staffelBelegungToPrettyString(
    konfiguration: Konfiguration,
    staffelBelegung: StaffelBelegung,
): String {
    val schwimmerZeilen =
        staffelBelegung.startBelegungen
            .joinToString("\n") { startBelegung ->
                val zeit =
                    konfiguration.getZeit(
                        disziplinId = startBelegung.disziplinId,
                        schimmerId = startBelegung.schwimmerId,
                    )
                val disziplin = konfiguration.disziplinen[startBelegung.disziplinId]
                val schwimmer = konfiguration.schwimmerList[startBelegung.schwimmerId]
                "${disziplin}\t${schwimmer.name}\t${formatZeit(zeit)}"
            }
    return """
Staffel: ${staffelBelegung.staffel.name}
$schwimmerZeilen
Gesamtzeit		${formatZeit(staffelBelegung.gesamtZeit)}
        """.trimIndent()
}
