package org.example.schwimmen.eingabe

import org.example.schwimmen.model.Staffel

fun parseStaffeln(data: String): List<Staffel> = parseStaffeln(data.lines().map { it.split("\t") })

fun parseStaffeln(rows: List<List<String>>): List<Staffel> {
    val result = mutableListOf<Staffel>()
    var staffelBuilder: StaffelBuilder? = null
    for (row in rows) {
        if (isHeader(row)) {
            staffelBuilder?.let { result.add(it.build()) }
            staffelBuilder = StaffelBuilder(row[1], mutableListOf())
        } else if (row[0].isNotBlank()) {
            (staffelBuilder ?: error("Konfigurationsformat falsch. Header 'Staffel' nicht gefunden.")).startsDisziplinen.add(
                Pair(row[0].toInt(), row[1]),
            )
        }
    }

    staffelBuilder?.let { result.add(it.build()) }

    return result
}

private fun isHeader(row: List<String>): Boolean = row[0].trim() == "Staffel"

data class StaffelBuilder(
    val name: String,
    val startsDisziplinen: MutableList<Pair<Int, String>>,
) {
    fun build(): Staffel =
        Staffel(
            name,
            startsDisziplinen.flatMap { (starts, disziplin) -> List(starts) { disziplin } },
            team = name.contains("team", ignoreCase = true),
        )
}
