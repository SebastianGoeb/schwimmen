package org.example.schwimmen.eingabe

import org.example.schwimmen.eingabe.Geschlecht.FEMALE
import org.example.schwimmen.eingabe.Geschlecht.MALE

val geschlechtEJugend: Map<String, Geschlecht> =
    mapOf(
        "Luisa Reimann" to FEMALE,
        "Oskar Henri Knaier" to MALE,
        "Jakob Schwabe" to MALE,
        "Nico Philipp Kronenberger" to MALE,
        "Will Unger" to MALE,
        "Alexander Graiche" to MALE,
        "Sophie Kliem" to FEMALE,
        "Melina Papapetrou" to FEMALE,
        "Helena Condic" to FEMALE,
        "Samuel Grube" to MALE,
        "Nea Louise Benner" to FEMALE,
        "Bendix Bundt" to MALE,
        "Jana Nagel" to FEMALE,
        "Bastian Lutz" to MALE,
        "Siri Engelbrecht" to FEMALE,
        "Smilla Engelbrecht" to FEMALE,
        "Moritz Heitmann" to MALE,
        "Niklas Martin Berberich" to MALE,
        "Nina Höhn" to FEMALE,
        "Marwan Mikkawi" to MALE,
        "Lius Wolf" to MALE,
        "Thia Markov" to FEMALE,
        "Dalia Pepeljak" to FEMALE,
    )

val geschlechtFJugend: Map<String, Geschlecht> =
    mapOf(
        "Theo Kemmerer" to MALE,
        "Sophie Neumann" to FEMALE,
        "Leo Tan" to MALE,
        "Leonie Sophie Wiehlpütz" to FEMALE,
        "Hanna Grünig" to FEMALE,
        "Havva Karakaya" to FEMALE,
        "Arthur Kleber" to MALE,
        "Marie Gädke" to FEMALE,
        "Marlene Trapper" to FEMALE,
        "Benno Reimann" to MALE,
    )

enum class Geschlecht {
    MALE,
    FEMALE,
}
