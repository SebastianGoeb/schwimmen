package org.example.schwimmen.model

import kotlin.time.Duration

data class Konfiguration(
    val alleMuessenSchwimmen: Boolean,
    val minSchwimmerProTeam: Int,
    val maxSchwimmerProTeam: Int,
    val maxStartsProSchwimmer: Int,
    val staffeln: List<Staffel>,
    val anzahlTeams: Int,
    val maxZeitspanneProStaffel: Duration,
    val schwimmerList: List<Schwimmer>,
) {
    val stilToSchwimmerToZeit: Map<String, Map<String, Duration>> by lazy {
        mutableMapOf<String, MutableMap<String, Duration>>().apply {
            schwimmerList.forEach { schwimmer ->
                schwimmer.zeiten.forEach { (stil, zeit) ->
                    this.computeIfAbsent(stil) { mutableMapOf() }[schwimmer.name] = zeit
                }
            }
        }
    }

    val stilToSchwimmerZeiten: Map<String, List<SchwimmerZeit>> by lazy {
        mutableMapOf<String, MutableList<SchwimmerZeit>>().apply {
            for (schwimmer in schwimmerList) {
                schwimmer.zeiten.forEach { (stil, zeit) ->
                    computeIfAbsent(stil) { mutableListOf() }.add(SchwimmerZeit(schwimmer.name, zeit))
                }
            }
            this.values.forEach { entry -> entry.sortBy { it.zeit } }
        }
    }
}
