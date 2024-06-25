package org.example.schwimmen.parser

import org.example.schwimmen.konfiguration.SchwimmerZeit
import org.example.schwimmen.util.parseZeit

fun parseTimesFromTallTable(data: String): List<StilZeiten> {
    val rows = data.lines().map { it.split("\t") }
    return parseStilZeiten(rows)
}

fun parseStilZeiten(rows: List<List<String>>): List<StilZeiten> {
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
            parseSchwimmerZeit(group.stil, row)?.let { group.zeiten.add(it) }
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

private fun parseSchwimmerZeit(
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

data class StilZeiten(
    val stil: String,
    val zeiten: MutableList<SchwimmerZeit>,
)
