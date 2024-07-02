package org.example.schwimmen.search.ga.pairing

import org.example.schwimmen.search.State
import kotlin.random.Random.Default.nextDouble
import kotlin.time.DurationUnit.MINUTES

data class RandomPairing(
    val parents: List<State>,
) {
    val cumulativeScoresMinutes: List<Double> =
        parents.runningFold(0.0) { acc, parent -> acc + parent.score.toDouble(MINUTES) }.drop(1)

    fun selectPair(): Pair<State, State> = Pair(selectSingle(), selectSingle())

    fun selectSingle(): State {
        val randomScoreMinutes = nextDouble(cumulativeScoresMinutes.last())
        val index = cumulativeScoresMinutes.indexOfLast { randomScoreMinutes < it }
        return parents[index]
    }
}
