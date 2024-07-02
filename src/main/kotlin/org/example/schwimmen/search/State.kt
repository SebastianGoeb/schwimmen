package org.example.schwimmen.search

import org.example.schwimmen.eingabe.Geschlecht.FEMALE
import org.example.schwimmen.eingabe.Geschlecht.MALE
import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.Staffel
import org.example.schwimmen.model.StartBelegung
import kotlin.math.max
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes

private val strafMinutenProRegelverstoss = 5.minutes

data class State(
    val teams: List<Team>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit: Duration by lazy { teams.map { it.gesamtZeit }.reduce(Duration::plus) }

    val startsProSchwimmer: IntArray = calculateStartsProSchwimmer()

    private fun calculateStartsProSchwimmer(): IntArray {
        val starts = IntArray(konfiguration.schwimmerList.size)
        for (team in teams) {
            for (staffelBelegung in team.staffelBelegungen) {
                for (startBelegung in staffelBelegung.startBelegungen) {
                    starts[startBelegung.schwimmerId] += 1
                }
            }
        }
        return starts
    }

    val schwimmerInMehrerenTeams: Map<Int, Set<String>> by lazy {
        mutableMapOf<Int, MutableSet<String>>()
            .apply {
                teams.forEach { team ->
                    team.staffelBelegungen.forEach { staffelBelegung ->
                        staffelBelegung.startBelegungen.forEach { startBelegung ->
                            this.computeIfAbsent(startBelegung.schwimmerId) { mutableSetOf() }.add(team.name)
                        }
                    }
                }
            }.run { this.filterValues { it.size > 1 } }
    }

    val zeitspannePenalty: Duration =
        if (konfiguration.anzahlTeams <= 1) {
            Duration.ZERO
        } else {
            var penalty = Duration.ZERO
            for (i in konfiguration.staffeln.indices) {
                val spanne = teams.maxOf { it.staffelBelegungen[i].gesamtZeit } - teams.minOf { it.staffelBelegungen[i].gesamtZeit }
                if (spanne > konfiguration.maxZeitspanneProStaffel) {
                    penalty += spanne + strafMinutenProRegelverstoss
                }
            }
            penalty
        }
    val maxStartsProSchwimmerViolations: Int =
        run {
            var violations = 0
            for (schwimmerId in startsProSchwimmer.indices) {
                val starts = startsProSchwimmer[schwimmerId]
                violations += max(starts - konfiguration.maxStartsProSchwimmerLookup[schwimmerId], 0)
            }
            violations
        }
    val minStartsProSchwimmerViolations: Int =
        run {
            var violations = 0
            for (schwimmerId in startsProSchwimmer.indices) {
                val starts = startsProSchwimmer[schwimmerId]
                violations += max(konfiguration.minStartsProSchwimmerLookup[schwimmerId] - starts, 0)
            }
            violations
        }

    val alleMuessenSchwimmenViolations: Int =
        if (konfiguration.alleMuessenSchwimmen) konfiguration.schwimmerList.size - startsProSchwimmer.count { it > 0 } else 0

    val schwimmerInMehrerenTeamsViolations: Int =
        calculateSchwimmerInMehrerenTeamsViolations()

    val valide: Boolean =
        teams.all { it.valide } &&
            maxStartsProSchwimmerViolations == 0 &&
            minStartsProSchwimmerViolations == 0 &&
            alleMuessenSchwimmenViolations == 0 &&
            schwimmerInMehrerenTeamsViolations == 0 &&
            zeitspannePenalty == Duration.ZERO

    val score: Duration =
        teams.map { it.score }.reduce(Duration::plus) +
            strafMinutenProRegelverstoss * maxStartsProSchwimmerViolations +
            strafMinutenProRegelverstoss * minStartsProSchwimmerViolations +
            strafMinutenProRegelverstoss * alleMuessenSchwimmenViolations +
            strafMinutenProRegelverstoss * schwimmerInMehrerenTeamsViolations +
            zeitspannePenalty

    private fun calculateSchwimmerInMehrerenTeamsViolations(): Int {
        val hasMultipleTeams = BooleanArray(konfiguration.schwimmerList.size)
        val primaryTeamNumber = IntArray(konfiguration.schwimmerList.size) { -1 }
        teams.forEachIndexed { index, team ->
            for (staffelBelegung in team.staffelBelegungen) {
                for (startBelegung in staffelBelegung.startBelegungen) {
                    val id = startBelegung.schwimmerId
                    if (!hasMultipleTeams[id]) {
                        if (primaryTeamNumber[id] == -1) {
                            primaryTeamNumber[id] = index
                        } else if (primaryTeamNumber[id] != index) {
                            hasMultipleTeams[id] = true
                        }
                    }
                }
            }
        }
        return hasMultipleTeams.count { it }
    }
}

data class Team(
    // TODO team-id
    val name: String,
    val staffelBelegungen: List<StaffelBelegung>,
    val konfiguration: Konfiguration,
) {
    val gesamtZeit: Duration by lazy { staffelBelegungen.map { it.gesamtZeit }.reduce(Duration::plus) }
    private val anzahlSchwimmer = countSchwimmer()

    private val minSchwimmerViolations = max(konfiguration.minSchwimmerProTeam - anzahlSchwimmer, 0)
    private val maxSchwimmerViolations = max(anzahlSchwimmer - konfiguration.maxSchwimmerProTeam, 0)
    private val geschlechter = countGeschlechter()
    private val minMaleViolations: Int = if (geschlechter.first >= konfiguration.minMaleProTeam) 0 else 1
    private val minFemaleViolations: Int = if (geschlechter.second >= konfiguration.minFemaleProTeam) 0 else 1

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

    private fun countSchwimmer(): Int {
        val present = BooleanArray(konfiguration.schwimmerList.size)
        for (staffelBelegung in staffelBelegungen) {
            for (startBelegung in staffelBelegung.startBelegungen) {
                val schwimmerId = startBelegung.schwimmerId
                present[schwimmerId] = true
            }
        }
        return present.count { it }
    }

    private fun countGeschlechter(): Pair<Int, Int> {
        val males = BooleanArray(konfiguration.schwimmerList.size)
        val females = BooleanArray(konfiguration.schwimmerList.size)
        for (staffelBelegung in staffelBelegungen) {
            for (startBelegung in staffelBelegung.startBelegungen) {
                val schwimmerId = startBelegung.schwimmerId
                val geschlecht = konfiguration.getGeschlecht(schwimmerId)
                if (geschlecht == MALE) {
                    males[schwimmerId] = true
                } else {
                    females[schwimmerId] = true
                }
            }
        }
        return Pair(males.count { it }, females.count { it })
    }
}

data class StaffelBelegung(
    val staffel: Staffel,
    val konfiguration: Konfiguration,
    val startBelegungen: List<StartBelegung>,
) {
    val gesamtZeit: Duration =
        startBelegungen
            .asSequence()
            .map { (schimmerId, disziplinId) -> konfiguration.getZeit(disziplinId, schimmerId) }
            .let { if (staffel.team) it.max() else it.reduce(Duration::plus) }

    private val maxOneStartProSchwimmerViolations =
        run {
            val starts = IntArray(konfiguration.schwimmerList.size)
            for (startBelegung in startBelegungen) {
                starts[startBelegung.schwimmerId]++
            }
            starts.sumOf { max(it - 1, 0) }
        }

    private val minOneMaleViolations: Int =
        if (startBelegungen.count { konfiguration.getGeschlecht(it.schwimmerId) == MALE } >= 1) 0 else 1
    private val minOneFemaleViolations: Int =
        if (startBelegungen.count { konfiguration.getGeschlecht(it.schwimmerId) == FEMALE } >= 1) 0 else 1

    val score: Duration =
        gesamtZeit +
            strafMinutenProRegelverstoss * maxOneStartProSchwimmerViolations +
            strafMinutenProRegelverstoss * minOneMaleViolations +
            strafMinutenProRegelverstoss * minOneFemaleViolations
}
