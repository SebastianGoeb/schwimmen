package org.example.schwimmen.eingabe

fun parseAbwesenheiten(data: String): List<String> = parseAbwesenheiten(data.lines().map { it.split("\t") })

fun parseAbwesenheiten(rows: List<List<String>>): List<String> = rows.mapNotNull { it.getOrNull(0) }
