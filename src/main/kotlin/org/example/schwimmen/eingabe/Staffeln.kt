package org.example.schwimmen.eingabe

import org.example.schwimmen.model.Staffel
import org.example.schwimmen.model.StilStarts

val STAFFELN =
    listOf(
        Staffel("4x 25m Kraul", listOf(StilStarts("25m Kraul", 4)), false),
        Staffel("4x 25m BrAr", listOf(StilStarts("25m BrAr/KrBei", 4)), false),
        Staffel("4x 25m Brust", listOf(StilStarts("25m Brust", 4)), false),
        Staffel(
            "6x 25m Lagen Beine",
            listOf(
                StilStarts("25m Rücken Beine", 2),
                StilStarts("25m Brust Beine", 2),
                StilStarts("25m Kraul Beine", 2),
            ),
            false,
        ),
        Staffel("4x 25m Rücken", listOf(StilStarts("25m Rücken", 4)), false),
        Staffel("4x 200m Team", listOf(StilStarts("200m Team", 4)), true),
        Staffel(
            "6x 25m Lagen",
            listOf(
                StilStarts("25m Rücken", 2),
                StilStarts("25m Brust", 2),
                StilStarts("25m Kraul", 2),
            ),
            false,
        ),
    )
