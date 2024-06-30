package org.example.schwimmen.search.ga.crossover

import org.example.schwimmen.search.Ergebnis
import kotlin.random.Random

class OnePointAnywhereCrossover {
    fun crossover(
        parentA: Ergebnis,
        parentB: Ergebnis,
    ): Ergebnis {
        val teamIndex = parentA.teams.indices.random()
        val staffelIndex =
            parentA.teams[teamIndex]
                .staffelBelegungen.indices
                .random()
        val startIndex =
            parentA.teams[teamIndex]
                .staffelBelegungen[staffelIndex]
                .startBelegungen.indices
                .random()
        return if (Random.nextBoolean()) {
            combine(parentA, parentB, teamIndex, staffelIndex, startIndex)
        } else {
            combine(parentB, parentA, teamIndex, staffelIndex, startIndex)
        }
    }

    private fun combine(
        parentA: Ergebnis,
        parentB: Ergebnis,
        teamCrossoverIndex: Int,
        staffelCrossoverIndex: Int,
        startCrossoverIndex: Int,
    ): Ergebnis =
        parentA.copy(
            teams =
                parentA.teams
                    .zip(parentB.teams)
                    .mapIndexed { teamIndex, (teamA, teamB) ->
                        if (teamIndex < teamCrossoverIndex) {
                            teamA
                        } else if (teamIndex > teamCrossoverIndex) {
                            teamB
                        } else {
                            teamA.copy(
                                staffelBelegungen =
                                    teamA.staffelBelegungen
                                        .zip(teamB.staffelBelegungen)
                                        .mapIndexed { staffelIndex, (staffelA, staffelB) ->
                                            if (staffelIndex < staffelCrossoverIndex) {
                                                staffelA
                                            } else if (staffelIndex > staffelCrossoverIndex) {
                                                staffelB
                                            } else {
                                                staffelA.copy(
                                                    startBelegungen =
                                                        staffelA.startBelegungen
                                                            .zip(staffelB.startBelegungen)
                                                            .mapIndexed { startIndex, (startA, startB) ->
                                                                if (startIndex < startCrossoverIndex) {
                                                                    startA
                                                                } else {
                                                                    startB
                                                                }
                                                            },
                                                )
                                            }
                                        },
                            )
                        }
                    },
        )
}
