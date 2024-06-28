package org.example.schwimmen.eingabe

import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import java.io.File
import kotlin.time.Duration.Companion.seconds

class ZeitenTest :
    FreeSpec({
        "should read zeiten.tsv" {
            val stilZeiten = parseStilZeiten(File("src/main/resources/f_jugend/zeiten.tsv").readText())
            stilZeiten[0].name shouldBe "Hanna Grünig"
            stilZeiten[0].zeiten["25m Rücken"] shouldBe 27.3.seconds
        }
    })
