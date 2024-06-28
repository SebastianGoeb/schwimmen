package org.example.schwimmen.eingabe

import org.example.schwimmen.model.Schwimmer
import org.example.schwimmen.model.SchwimmerZeit
import org.example.schwimmen.util.parseZeit
import kotlin.time.Duration

fun parseStilZeiten(data: String): List<Schwimmer> {
    val rows = data.lines().map { it.split("\t") }
    val zeitenByStil = parseStilZeitenFromGrid(rows)
    return groupBySchwimmer(zeitenByStil)
}

private fun parseStilZeitenFromGrid(rows: List<List<String>>): List<StilZeiten> {
    val rowGroups = mutableListOf<StilZeiten>()

    var group: StilZeiten? = null
    for (row in rows) {
        if (isHeaderRow(row)) {
            // finish previous group, if necessary
            if (group != null) {
                rowGroups.add(group)
            }

            // start new group
            group = StilZeiten(row[0], mutableListOf())
        }

        // process zeit
        if (group != null) {
            parseSchwimmerZeitRow(group.stil, row)?.let { group.zeiten.add(it) }
        } else {
            println("Es gibt Zeiteinträge, die keinem Schwimmstil zugeordnet sind: ${row.joinToString(" ")}")
        }
    }

    // finish final group, if necessary
    if (group != null) {
        rowGroups.add(group)
    }

    return rowGroups
}

private fun isHeaderRow(row: List<String>) = row[0].isNotBlank()

private fun parseSchwimmerZeitRow(
    stil: String,
    row: List<String>,
): SchwimmerZeit? {
    val nameCell = row.getOrElse(1) { "" }
    if (nameCell.isBlank()) {
        return null
    }

    val zeitCell = row.getOrElse(3) { "" }
    if (zeitCell.isBlank()) {
        println("Warnung, es gibt Namen ohne Zeiten im Stil '$stil': ${row.joinToString(" ")}")
        return null
    }

    return SchwimmerZeit(nameCell, parseZeit(zeitCell))
}

private fun groupBySchwimmer(stilZeitenList: List<StilZeiten>): List<Schwimmer> {
    val schwimmerList = mutableMapOf<String, MutableMap<String, Duration>>()

    stilZeitenList.forEach { (stil, zeiten) ->
        zeiten.forEach { (name, zeit) ->
            schwimmerList.computeIfAbsent(name) { mutableMapOf() }[stil] = zeit
        }
    }

    return schwimmerList.map { Schwimmer(it.key, it.value) }
}

private data class StilZeiten(
    val stil: String,
    val zeiten: MutableList<SchwimmerZeit>,
)
