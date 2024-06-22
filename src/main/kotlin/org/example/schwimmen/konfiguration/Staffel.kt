package org.example.schwimmen.konfiguration

data class Staffel(
    val stileAnzahl: List<StilStarts>,
    val team: Boolean,
) {
    val name: String by lazy { stileAnzahl.joinToString { "${it.starts}x ${it.stil}" } }
}

data class StilStarts(
    val stil: String,
    val starts: Int,
)
