package org.example.schwimmen.parser

import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import org.example.schwimmen.konfiguration.SchwimmerZeit
import java.io.File
import kotlin.time.Duration.Companion.seconds

class TallTableTest :
    FreeSpec({
        "should read jugend_f_zeiten.tsv" {
            val stilZeiten = parseTimesFromTallTable(File("src/main/resources/jugend_f_zeiten.tsv").readText())
            stilZeiten[0].stil shouldBe "25m Rücken"
            stilZeiten[0].zeiten[0] shouldBe SchwimmerZeit("Hanna Grünig", 27.3.seconds)
        }
    })
