package org.example.schwimmen.suche

import org.example.schwimmen.konfiguration.Konfiguration
import org.example.schwimmen.konfiguration.SchwimmerStil
import org.example.schwimmen.konfiguration.Staffel
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.sqrt
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes
import kotlin.time.DurationUnit.MINUTES

private val stilThenName = compareBy<SchwimmerStil> { it.stil }.thenBy { it.name }

private val maxStartsProSchwimmerProStaffel = 1
private val zeitStdDevPenaltyMultiplier = 1
private val strafMinutenProRegelverstoss = 5.minutes

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
        val doppelbelegungenPenalty =
            strafMinutenProRegelverstoss *
                startBelegungen
                    .groupBy { it.name }
                    .map { it.value.size - maxStartsProSchwimmerProStaffel }
                    .sum()
        gesamtZeit + doppelbelegungenPenalty
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
    val teams: List<Team>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit: Duration by lazy { teams.map { it.gesamtZeit }.reduce(Duration::plus) }
    val zeitStdDev: Duration by lazy {
        if (teams.size <= 1) {
            Duration.ZERO
        } else {
            val teamMinutes = teams.map { it.gesamtZeit.toDouble(MINUTES) }
            val meanZeit = teamMinutes.average()
            sqrt(teamMinutes.sumOf { (it - meanZeit).pow(2) } / teams.size).minutes
        }
    }

    val startsProSchwimmer: MutableMap<String, Int> by lazy {
        val result = mutableMapOf<String, Int>()
        teams.flatMap { it.staffelBelegungen }.forEach { staffelErgebnis ->
            staffelErgebnis.startBelegungen.forEach {
                result[it.name] = (result[it.name] ?: 0) + 1
            }
        }
        result
    }
    val schwimmerInMehrerenTeams: Map<String, Set<String>> by lazy {
        val teamZuweisungenProSchwimmer = mutableMapOf<String, MutableSet<String>>()
        teams.forEach { team ->
            team.staffelBelegungen.forEach { staffelBelegung ->
                staffelBelegung.startBelegungen.forEach { schwimmerStil ->
                    teamZuweisungenProSchwimmer.computeIfAbsent(schwimmerStil.name) { mutableSetOf() }.add(team.name)
                }
            }
        }
        teamZuweisungenProSchwimmer.filterValues { it.size > 1 }
    }

    val maxStartsProSchwimmerViolations: Int by lazy {
        startsProSchwimmer
            .map { max(it.value - konfiguration.maxStartsProSchwimmer, 0) }
            .sum()
    }

    val alleMuessenSchwimmenViolations: Int by lazy {
        if (konfiguration.alleMuessenSchwimmen) konfiguration.schwimmerList.size - startsProSchwimmer.size else 0
    }
    val schwimmerInMehrerenTeamsViolations: Int by lazy {
        val teamZuweisungenProSchwimmer = mutableMapOf<String, MutableList<String>>()
        teams.forEach { team ->
            team.staffelBelegungen.forEach { staffelBelegung ->
                staffelBelegung.startBelegungen.forEach { schwimmerStil ->
                    teamZuweisungenProSchwimmer.computeIfAbsent(schwimmerStil.name) { mutableListOf() }.add(team.name)
                }
            }
        }

        val startsInAnderenTeamsProSchimmer: Map<String, Int> =
            teamZuweisungenProSchwimmer.mapValues { (_, teamZuweisungen) ->
                val startsProTeam: Map<String, Int> = teamZuweisungen.groupBy { it }.mapValues { it.value.size }
                val mainTeam = startsProTeam.maxBy { it.value }.key
                startsProTeam.filterKeys { it != mainTeam }.values.sum()
            }

        startsInAnderenTeamsProSchimmer.values.sum()
    }

    val valide: Boolean by lazy {
        teams.all { it.valide } &&
            maxStartsProSchwimmerViolations == 0 &&
            alleMuessenSchwimmenViolations == 0 &&
            schwimmerInMehrerenTeamsViolations == 0
    }
    val score: Duration by lazy {
        teams.map { it.score }.reduce(Duration::plus) +
            strafMinutenProRegelverstoss * maxStartsProSchwimmerViolations +
            strafMinutenProRegelverstoss * alleMuessenSchwimmenViolations +
            strafMinutenProRegelverstoss * schwimmerInMehrerenTeamsViolations +
            zeitStdDev.times(zeitStdDevPenaltyMultiplier)
    }

    fun prettyStartsProSchwimmer(): String =
        """
Anzahl Starts:
${startsProSchwimmer.toSortedMap().map { "${it.key} x${it.value}" }.joinToString("\n")}
        """.trimIndent()
}

data class Team(
    val name: String,
    val staffelBelegungen: List<StaffelBelegung>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit = staffelBelegungen.map { it.gesamtZeit }.reduce(Duration::plus)
    val anzahlSchwimmer = staffelBelegungen.flatMap { it.startBelegungen }.distinctBy { it.name }.size

    val minSchwimmerViolations = max(konfiguration.minSchwimmerProTeam - anzahlSchwimmer, 0)
    val maxSchwimmerViolations = max(anzahlSchwimmer - konfiguration.maxSchwimmerProTeam, 0)

    val valide = minSchwimmerViolations == 0 && maxSchwimmerViolations == 0
    val score =
        staffelBelegungen.map { it.score }.reduce(Duration::plus) +
            strafMinutenProRegelverstoss * minSchwimmerViolations +
            strafMinutenProRegelverstoss * maxSchwimmerViolations

    // TODO min 2 M/W
}
