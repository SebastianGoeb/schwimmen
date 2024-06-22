package org.example.schwimmen.util

import com.github.doyaaaaaken.kotlincsv.dsl.context.InsufficientFieldsRowBehaviour
import com.github.doyaaaaaken.kotlincsv.dsl.csvReader
import org.example.schwimmen.konfiguration.Schwimmer
import kotlin.io.path.Path

fun parseTimes(location: String): List<Schwimmer> {
    val reader =
        csvReader {
            delimiter = '\t'
            insufficientFieldsRowBehaviour = InsufficientFieldsRowBehaviour.EMPTY_STRING
        }

    return reader.readAllWithHeader(Path(location).toFile()).map { row ->
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
