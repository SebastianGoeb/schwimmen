package org.example.schwimmen.eingabe

import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.shouldBe
import org.example.schwimmen.model.Staffel
import java.io.File

class StaffelnTest :
    FreeSpec({
        "should load data" {
            val expected =
                listOf(
                    Staffel(
                        "4 x 25 Kraul",
                        listOf(
                            "25m Kraul",
                            "25m Kraul",
                            "25m Kraul",
                            "25m Kraul",
                        ),
                        false,
                    ),
                    Staffel(
                        "4 x 25 Brust A Kr Beine",
                        listOf(
                            "25m BrAr/KrBei",
                            "25m BrAr/KrBei",
                            "25m BrAr/KrBei",
                            "25m BrAr/KrBei",
                        ),
                        false,
                    ),
                    Staffel(
                        "4 x 25 Brust",
                        listOf(
                            "25m Brust",
                            "25m Brust",
                            "25m Brust",
                            "25m Brust",
                        ),
                        false,
                    ),
                    Staffel(
                        "6 x 25 LG Beine",
                        listOf(
                            "25m Rücken Beine",
                            "25m Rücken Beine",
                            "25m Brust Beine",
                            "25m Brust Beine",
                            "25m Kraul Beine",
                            "25m Kraul Beine",
                        ),
                        false,
                    ),
                    Staffel(
                        "4 x 25 Rücken",
                        listOf(
                            "25m Rücken",
                            "25m Rücken",
                            "25m Rücken",
                            "25m Rücken",
                        ),
                        false,
                    ),
                    Staffel(
                        "200 Team",
                        listOf(
                            "200m Team",
                            "200m Team",
                            "200m Team",
                            "200m Team",
                        ),
                        true,
                    ),
                    Staffel(
                        "6 x 25 LG",
                        listOf(
                            "25m Rücken",
                            "25m Rücken",
                            "25m Brust",
                            "25m Brust",
                            "25m Kraul",
                            "25m Kraul",
                        ),
                        false,
                    ),
                )

            parseStaffeln(File("src/main/resources/staffeln.tsv").readText()) shouldBe expected
        }
    })
