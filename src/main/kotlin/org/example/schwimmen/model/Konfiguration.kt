package org.example.schwimmen.model

import org.example.schwimmen.eingabe.Geschlecht
import kotlin.time.Duration

data class Konfiguration(
    val alleMuessenSchwimmen: Boolean,
    val minSchwimmerProTeam: Int,
    val maxSchwimmerProTeam: Int,
    val minMaleProTeam: Int,
    val minFemaleProTeam: Int,
    val maxStartsProSchwimmer: Int,
    val anzahlTeams: Int,
    val maxZeitspanneProStaffel: Duration,
    val staffeln: List<Staffel>,
    val schwimmerList: List<Schwimmer>,
    val geschlecht: Map<String, Geschlecht>,
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

    fun valid(): Boolean {
        val zeitenNames = schwimmerList.map { it.name }.toSet()
        val geschlechtNames = geschlecht.keys

        with(zeitenNames subtract geschlechtNames) {
            if (this.isNotEmpty()) {
                println("Warnung, es gibt Zeiten zu denen kein Geschlecht angegeben wurde: $this")
                return false
            }
        }

        with(geschlechtNames subtract zeitenNames) {
            if (this.isNotEmpty()) {
                println("Warnung, es sind Geschlechter eingetragen zu denen keine Zeiten gibt: $this")
                return false
            }
        }

        return true
    }
}
