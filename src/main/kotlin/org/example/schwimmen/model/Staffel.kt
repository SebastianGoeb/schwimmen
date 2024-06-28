package org.example.schwimmen.model

data class Staffel(
    val name: String,
    val stileAnzahl: List<StilStarts>,
    val team: Boolean,
)

data class StilStarts(
    val stil: String,
    val starts: Int,
)
