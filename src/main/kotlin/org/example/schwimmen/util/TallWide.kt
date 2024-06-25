package org.example.schwimmen.util

import org.example.schwimmen.konfiguration.Schwimmer
import org.example.schwimmen.parser.StilZeiten
import kotlin.time.Duration

fun convertTallToWide(schwimmerZeiten: List<StilZeiten>): List<Schwimmer> {
    val schwimmerList = mutableMapOf<String, MutableMap<String, Duration>>()

    schwimmerZeiten.forEach { (stil, zeiten) ->
        zeiten.forEach { (name, zeit) ->
            schwimmerList.computeIfAbsent(name) { mutableMapOf() }[stil] = zeit
        }
    }

    return schwimmerList.map { Schwimmer(it.key, it.value) }
}
