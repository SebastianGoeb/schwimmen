package org.example.schwimmen.search

import org.example.schwimmen.eingabe.Geschlecht
import org.example.schwimmen.eingabe.Geschlecht.FEMALE
import org.example.schwimmen.eingabe.Geschlecht.MALE
import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.SchwimmerStil
import org.example.schwimmen.model.Staffel
import kotlin.math.max
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

private val stilThenName = compareBy<SchwimmerStil> { it.stil }.thenBy { it.name }

private val maxStartsProSchwimmerProStaffel = 1
private val strafMinutenProRegelverstoss = 5.minutes

data class Ergebnis(
    val teams: List<Team>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit = teams.map { it.gesamtZeit }.reduce(Duration::plus)
    val startsProSchwimmer: MutableMap<String, Int> =
        mutableMapOf<String, Int>().apply {
            teams.flatMap { it.staffelBelegungen }.forEach { staffelErgebnis ->
                staffelErgebnis.startBelegungen.forEach {
                    this[it.name] = (this[it.name] ?: 0) + 1
                }
            }
        }
    val schwimmerInMehrerenTeams: Map<String, Set<String>> =
        mutableMapOf<String, MutableSet<String>>().apply {
            teams.forEach { team ->
                team.staffelBelegungen.forEach { staffelBelegung ->
                    staffelBelegung.startBelegungen.forEach { schwimmerStil ->
                        this.computeIfAbsent(schwimmerStil.name) { mutableSetOf() }.add(team.name)
                    }
                }
            }
            this.filterValues { it.size > 1 }
        }

    val zeitspanneViolations: Int =
        if (konfiguration.anzahlTeams <= 1) {
            0
        } else {
            konfiguration.staffeln.indices
                .asSequence()
                .map { i -> teams.maxOf { it.staffelBelegungen[i].gesamtZeit } - teams.minOf { it.staffelBelegungen[i].gesamtZeit } }
                .filter { it > konfiguration.maxZeitspanneProStaffel }
                .count()
        }
    val maxStartsProSchwimmerViolations: Int =
        startsProSchwimmer
            .map { max(it.value - konfiguration.maxStartsProSchwimmer, 0) }
            .sum()

    val alleMuessenSchwimmenViolations: Int =
        if (konfiguration.alleMuessenSchwimmen) konfiguration.schwimmerList.size - startsProSchwimmer.size else 0

    val schwimmerInMehrerenTeamsViolations: Int by lazy {
        val teamZuweisungenProSchwimmer = mutableMapOf<String, MutableMap<String, Int>>()
        teams.forEach { team ->
            team.staffelBelegungen.forEach { staffelBelegung ->
                staffelBelegung.startBelegungen.forEach { schwimmerStil ->
                    val computeIfAbsent = teamZuweisungenProSchwimmer.computeIfAbsent(schwimmerStil.name) { mutableMapOf() }
                    computeIfAbsent[team.name] = (computeIfAbsent[team.name] ?: 0) + 1
                }
            }
        }

        val startsInAnderenTeamsProSchimmer: Map<String, Int> =
            teamZuweisungenProSchwimmer.mapValues { (_, startsProTeam) ->
                val mainTeam = startsProTeam.maxBy { it.value }.key
                startsProTeam.filterKeys { it != mainTeam }.values.sum()
            }

        startsInAnderenTeamsProSchimmer.values.sum()
    }

    val valide: Boolean by lazy {
        teams.all { it.valide } &&
            maxStartsProSchwimmerViolations == 0 &&
            alleMuessenSchwimmenViolations == 0 &&
            schwimmerInMehrerenTeamsViolations == 0 &&
            zeitspanneViolations == 0
    }

    val score: Duration by lazy {
        teams.map { it.score }.reduce(Duration::plus) +
            strafMinutenProRegelverstoss * maxStartsProSchwimmerViolations +
            strafMinutenProRegelverstoss * alleMuessenSchwimmenViolations +
            strafMinutenProRegelverstoss * schwimmerInMehrerenTeamsViolations +
            strafMinutenProRegelverstoss * zeitspanneViolations
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
    private val anzahlSchwimmer = staffelBelegungen.flatMap { it.startBelegungen }.distinctBy { it.name }.size

    private val minSchwimmerViolations = max(konfiguration.minSchwimmerProTeam - anzahlSchwimmer, 0)
    private val maxSchwimmerViolations = max(anzahlSchwimmer - konfiguration.maxSchwimmerProTeam, 0)
    private val minMaleViolations: Int = if (totalGeschlecht(MALE) >= konfiguration.minMaleProTeam) 0 else 1
    private val minFemaleViolations: Int = if (totalGeschlecht(FEMALE) >= konfiguration.minFemaleProTeam) 0 else 1

    val valide =
        minSchwimmerViolations == 0 &&
            maxSchwimmerViolations == 0 &&
            minMaleViolations == 0 &&
            minFemaleViolations == 0
    val score =
        staffelBelegungen.map { it.score }.reduce(Duration::plus) +
            strafMinutenProRegelverstoss * minSchwimmerViolations +
            strafMinutenProRegelverstoss * maxSchwimmerViolations +
            strafMinutenProRegelverstoss * minMaleViolations +
            strafMinutenProRegelverstoss * minFemaleViolations

    private fun totalGeschlecht(geschlecht: Geschlecht) =
        staffelBelegungen
            .asSequence()
            .flatMap { it.startBelegungen }
            .count { konfiguration.geschlecht[it.name] == geschlecht }
}

data class StaffelBelegung(
    val staffel: Staffel,
    val konfiguration: Konfiguration,
    val startBelegungen: List<SchwimmerStil>,
) {
    val gesamtZeit: Duration =
        startBelegungen
            .map { zuweisung ->
                val schwimmerZeiten =
                    konfiguration.stilToSchwimmerToZeit[zuweisung.stil] ?: error("Programmierfehler")
                schwimmerZeiten[zuweisung.name] ?: error("Programmierfehler")
            }.let { if (staffel.team) it.max() else it.reduce(Duration::plus) }

    private val doppelbelegungenViolations =
        startBelegungen
            .groupBy { it.name }
            .map { max(it.value.size - maxStartsProSchwimmerProStaffel, 0) }
            .sum()

    private val minOneMaleViolations: Int =
        if (startBelegungen.count { konfiguration.geschlecht[it.name] == MALE } >= 1) 0 else 1
    private val minOneFemaleViolations: Int =
        if (startBelegungen.count { konfiguration.geschlecht[it.name] == FEMALE } >= 1) 0 else 1

    val score: Duration =
        gesamtZeit +
            strafMinutenProRegelverstoss * doppelbelegungenViolations +
            strafMinutenProRegelverstoss * minOneMaleViolations +
            strafMinutenProRegelverstoss * minOneFemaleViolations

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
