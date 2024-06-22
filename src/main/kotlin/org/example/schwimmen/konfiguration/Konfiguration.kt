package org.example.schwimmen.konfiguration

import kotlin.time.Duration

data class Konfiguration(
    val minSchwimmer: Int,
    val maxSchwimmer: Int,
    val maxStartsProSchwimmer: Int,
    val staffeln: List<Staffel>,
    val schwimmerList: List<Schwimmer>,
) {
    val stilToSchwimmerToZeit: Map<String, Map<String, Duration>> by lazy { buildStilToSchwimmerToZeit(schwimmerList) }
    val stilToSchwimmerZeiten: Map<String, List<SchwimmerZeit>> by lazy { buildStilToSchwimmerZeiten(schwimmerList) }
    val schwimmerToStilZeiten: Map<String, List<StilZeit>> by lazy { buildSchwimmerToStilZeiten(schwimmerList) }
}

private fun buildStilToSchwimmerToZeit(schwimmerList: List<Schwimmer>): Map<String, Map<String, Duration>> {
    val result = mutableMapOf<String, MutableMap<String, Duration>>()

    for (schwimmer in schwimmerList) {
        schwimmer.zeiten.forEach { (stil, zeit) ->
            val nameToZeit = result.computeIfAbsent(stil) { mutableMapOf() }
            nameToZeit[schwimmer.name] = zeit
        }
    }

    return result
}

private fun buildStilToSchwimmerZeiten(schwimmerList: List<Schwimmer>): Map<String, List<SchwimmerZeit>> {
    val result = mutableMapOf<String, MutableList<SchwimmerZeit>>()

    for (schwimmer in schwimmerList) {
        schwimmer.zeiten.forEach { (stil, zeit) ->
            val schwimmerZeiten = result.computeIfAbsent(stil) { mutableListOf() }
            schwimmerZeiten.add(SchwimmerZeit(schwimmer.name, zeit))
        }
    }

    result.values.forEach { it.sortBy { it.zeit } }

    return result
}

private fun buildSchwimmerToStilZeiten(schwimmerList: List<Schwimmer>): Map<String, List<StilZeit>> {
    val result = mutableMapOf<String, MutableList<StilZeit>>()

    for (schwimmer in schwimmerList) {
        schwimmer.zeiten.forEach { (stil, zeit) ->
            val stilZeiten = result.computeIfAbsent(schwimmer.name) { mutableListOf() }
            stilZeiten.add(StilZeit(stil, zeit))
        }
    }

    result.values.forEach { it.sortBy { it.zeit } }

    return result
}
