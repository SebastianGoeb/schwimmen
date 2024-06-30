package org.example.schwimmen.search.ga.selection

import org.example.schwimmen.search.Ergebnis
import kotlin.time.Duration

data class TournamentSelection(
    val tournamentSize: Int,
    val withReplacement: Boolean,
) {
    fun selectParents(population: List<Ergebnis>): List<Ergebnis> {
        val selectedParents = mutableListOf<Ergebnis>()

        repeat(population.size) {
            if (withReplacement) {
                selectedParents.add(runTournamentWithReplacement(population))
            } else {
                selectedParents.add(runTournamentWithoutReplacement(population))
            }
        }

        return selectedParents
    }

    private fun runTournamentWithoutReplacement(population: List<Ergebnis>): Ergebnis {
        val remainingIndices = population.indices.toMutableList()
        var best: Ergebnis? = null

        repeat(tournamentSize) {
            val selectedIndex = remainingIndices.random()
            val candidate = population[selectedIndex]
            best = if ((best?.score ?: Duration.INFINITE) < candidate.score) best else candidate
            remainingIndices.remove(selectedIndex)
        }

        return best!!
    }

    private fun runTournamentWithReplacement(population: List<Ergebnis>): Ergebnis {
        var best: Ergebnis? = null

        repeat(tournamentSize) {
            val candidate = population.random()
            best = if ((best?.score ?: Duration.INFINITE) < candidate.score) best else candidate
        }

        return best!!
    }
}
