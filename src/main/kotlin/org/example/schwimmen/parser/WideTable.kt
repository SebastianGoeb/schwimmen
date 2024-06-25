package org.example.schwimmen.parser

import com.github.doyaaaaaken.kotlincsv.dsl.context.InsufficientFieldsRowBehaviour
import com.github.doyaaaaaken.kotlincsv.dsl.csvReader
import org.example.schwimmen.konfiguration.Schwimmer
import org.example.schwimmen.util.parseZeit

fun parseTimesFromWideTable(data: String): List<Schwimmer> {
    val reader =
        csvReader {
            delimiter = '\t'
            insufficientFieldsRowBehaviour = InsufficientFieldsRowBehaviour.EMPTY_STRING
        }

    return reader.readAllWithHeader(data).map { row ->
        row["Name"]
        Schwimmer(
            row["Name"] ?: error("Spalte 'Name' nicht gefunden"),
            row
                .filterKeys { it != "Name" }
                .filterValues { it.isNotBlank() }
                .mapValues { parseZeit(it.value) },
        )
    }
}
