package org.example.schwimmen.search.ga.crossover

import org.example.schwimmen.search.Ergebnis
import kotlin.random.Random

class OnePointStaffelCrossover {
    fun crossover(
        parentA: Ergebnis,
        parentB: Ergebnis,
    ): Ergebnis {
        val teamIndex = parentA.teams.indices.random()
        val staffelIndex =
            parentA.teams[teamIndex]
                .staffelBelegungen.indices
                .random()
        return if (Random.nextBoolean()) {
            combine(parentA, parentB, teamIndex, staffelIndex)
        } else {
            combine(parentB, parentA, teamIndex, staffelIndex)
        }
    }

    private fun combine(
        parentA: Ergebnis,
        parentB: Ergebnis,
        teamCrossoverIndex: Int,
        staffelCrossoverIndex: Int,
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
                                            } else {
                                                staffelB
                                            }
                                        },
                            )
                        }
                    },
        )
}
