package org.example.schwimmen

import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import org.example.schwimmen.konfiguration.Schwimmer
import org.example.schwimmen.util.parseTimes
import kotlin.time.Duration.Companion.seconds

class ParserTest :
    FreeSpec({
        "parseTimes" - {
            "should read data.tsv" {
                val swimmers = parseTimes("src/main/resources/data.tsv")
                swimmers[0] shouldBe
                    Schwimmer(
                        "Arthur Kleber",
                        mapOf(
                            "Rücken" to 30.1.seconds,
                            "Rücken-Beine" to 34.8.seconds,
                            "Kraul-Beine" to 31.5.seconds,
                            "Freistil" to 35.3.seconds,
                        ),
                    )
            }
        }
    })
