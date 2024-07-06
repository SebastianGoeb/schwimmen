package org.example.schwimmen.eingabe

fun parseMinMax(data: String): Map<String, MinMax> = parseMinMax(data.lines().map { it.split("\t") })

fun parseMinMax(rows: List<List<String>>): Map<String, MinMax> =
    rows
        .filter { it.size >= 3 && (0..2).all { i -> it[i].isNotBlank() } }
        .associate { it[0] to MinMax(min = it[1].toIntOrNull(), max = it[2].toIntOrNull()) }

data class MinMax(
    val min: Int?,
    val max: Int?,
)
