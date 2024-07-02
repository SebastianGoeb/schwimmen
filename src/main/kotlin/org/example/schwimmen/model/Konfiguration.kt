package org.example.schwimmen.model

import org.example.schwimmen.eingabe.Geschlecht
import kotlin.time.Duration

data class Konfiguration(
    val alleMuessenSchwimmen: Boolean,
    val minSchwimmerProTeam: Int,
    val maxSchwimmerProTeam: Int,
    val minMaleProTeam: Int,
    val minFemaleProTeam: Int,
    val minStartsProSchwimmer: Map<String, Int>,
    val minStartsProSchwimmerDefault: Int,
    val maxStartsProSchwimmer: Map<String, Int>,
    val maxStartsProSchwimmerDefault: Int,
    val anzahlTeams: Int,
    val maxZeitspanneProStaffel: Duration,
    val staffeln: List<Staffel>,
    val schwimmerList: List<Schwimmer>,
    val geschlecht: Map<String, Geschlecht>,
) {
    val disziplinen: List<String> = staffeln.flatMap { it.startDisziplinPaare }.distinct()

    // ==== fast id/offset-based lookups ====
    private val disziplinToSchwimmerToZeit: List<List<Duration?>> =
        disziplinen.map { disziplin ->
            schwimmerList.map { schwimmer -> schwimmer.zeiten[disziplin] }
        }
    private val disziplinToSchwimmerZeitPairs: List<List<SchwimmerIdZeit>> =
        disziplinen.map { disziplin ->
            schwimmerList.mapIndexedNotNull { schwimmerId, schwimmer ->
                schwimmer.zeiten[disziplin]?.let { SchwimmerIdZeit(schwimmerId, it) }
            }
        }

    private val schwimmerToGeschlecht: List<Geschlecht> =
        schwimmerList.map { geschlecht[it.name] ?: error("Geschlecht für Schwimmer ${it.name} wurde nicht gefunden") }
    val minStartsProSchwimmerLookup: List<Int> =
        schwimmerList.map { minStartsProSchwimmer[it.name] ?: minStartsProSchwimmerDefault }
    val maxStartsProSchwimmerLookup: List<Int> =
        schwimmerList.map { maxStartsProSchwimmer[it.name] ?: maxStartsProSchwimmerDefault }

    fun getZeit(
        disziplinId: Int,
        schimmerId: Int,
    ): Duration = disziplinToSchwimmerToZeit[disziplinId][schimmerId] ?: error("Programmierfehler")

    fun getZeiten(disziplinId: Int): List<SchwimmerIdZeit> = disziplinToSchwimmerZeitPairs[disziplinId]

    fun getGeschlecht(schwimmerId: Int): Geschlecht = schwimmerToGeschlecht[schwimmerId]

    // ==== slow lookup for ids ====
    val schwimmerNameToId = schwimmerList.withIndex().associate { it.value.name to it.index }
    val disziplinNameToId = disziplinen.withIndex().associate { it.value to it.index }

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
