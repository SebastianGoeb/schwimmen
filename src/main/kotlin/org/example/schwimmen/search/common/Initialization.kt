package org.example.schwimmen.search.common

import org.example.schwimmen.model.Konfiguration
import org.example.schwimmen.model.Staffel
import org.example.schwimmen.model.StartBelegung
import org.example.schwimmen.search.StaffelBelegung
import org.example.schwimmen.search.Team

// slow (name-based lookup)
fun initialRandomAssignment(konfiguration: Konfiguration): List<Team> =
    List(konfiguration.anzahlTeams) { generateTeam(it + 1, konfiguration) }

private fun generateTeam(
    teamNumber: Int,
    konfiguration: Konfiguration,
) = Team(
    name = "Team $teamNumber",
    staffelBelegungen = konfiguration.staffeln.map { staffel -> generateStaffelbelegung(staffel, konfiguration) },
    konfiguration = konfiguration,
)

private fun generateStaffelbelegung(
    staffel: Staffel,
    konfiguration: Konfiguration,
) = StaffelBelegung(
    staffel = staffel,
    konfiguration = konfiguration,
    startBelegungen = staffel.startDisziplinPaare.map { disziplinName -> generateStartBelegung(konfiguration, disziplinName) },
)

private fun generateStartBelegung(
    konfiguration: Konfiguration,
    disziplinName: String,
): StartBelegung {
    val disziplinId =
        konfiguration.disziplinNameToId[disziplinName]
            ?: error("Programmierfehler: Disziplin $disziplinName konnte nicht gefunden werden")
    val schwimmerIdsZuDenenEsZeitenGibt = konfiguration.getZeiten(disziplinId)
    // TODO proper type instead of pair?
    val schwimmerId = schwimmerIdsZuDenenEsZeitenGibt.random().schwimmerId
    return StartBelegung(schwimmerId = schwimmerId, disziplinId = disziplinId)
}
