package org.example.schwimmen.eingabe

import org.example.schwimmen.eingabe.Geschlecht.FEMALE
import org.example.schwimmen.eingabe.Geschlecht.MALE

fun parseGeschlechter(data: String): Map<String, Geschlecht> = parseGeschlechter(data.lines().map { it.split("\t") })

fun parseGeschlechter(rows: List<List<String>>): Map<String, Geschlecht> =
    rows
        .filter { it.size >= 2 && it[0].isNotBlank() && it[1].isNotBlank() }
        .associate { it[0] to toGeschlecht(it[1]) }

private fun toGeschlecht(it: String): Geschlecht =
    when (it) {
        "m" -> MALE
        "w" -> FEMALE
        else -> error("Unbekanntes Geschlecht $it")
    }

enum class Geschlecht {
    MALE,
    FEMALE,
}
