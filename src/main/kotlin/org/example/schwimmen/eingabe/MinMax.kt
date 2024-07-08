package org.example.schwimmen.eingabe

fun parseMinMax(data: String): Map<String, MinMax> = parseMinMax(data.lines().map { it.split("\t") })

fun parseMinMax(rows: List<List<String>>): Map<String, MinMax> =
    rows
        .filter { it.size >= 2 }
        .associate { it[0] to MinMax(min = it.getOrNull(1)?.toIntOrNull(), max = it.getOrNull(2)?.toIntOrNull()) }

data class MinMax(
    val min: Int?,
    val max: Int?,
)
