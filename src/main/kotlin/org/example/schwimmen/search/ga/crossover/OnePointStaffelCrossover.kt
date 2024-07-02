package org.example.schwimmen.search.ga.crossover

import org.example.schwimmen.search.State
import kotlin.random.Random

class OnePointStaffelCrossover {
    fun crossover(
        parentA: State,
        parentB: State,
    ): State {
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
        parentA: State,
        parentB: State,
        teamCrossoverIndex: Int,
        staffelCrossoverIndex: Int,
    ): State =
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
