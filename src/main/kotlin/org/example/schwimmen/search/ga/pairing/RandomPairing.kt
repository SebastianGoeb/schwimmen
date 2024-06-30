package org.example.schwimmen.search.ga.pairing

import org.example.schwimmen.search.Ergebnis
import kotlin.random.Random.Default.nextDouble
import kotlin.time.DurationUnit.MINUTES

data class RandomPairing(
    val parents: List<Ergebnis>,
) {
    val cumulativeScoresMinutes: List<Double> =
        parents.runningFold(0.0) { acc, parent -> acc + parent.score.toDouble(MINUTES) }.drop(1)

    fun selectPair(): Pair<Ergebnis, Ergebnis> = Pair(selectSingle(), selectSingle())

    fun selectSingle(): Ergebnis {
        val randomScoreMinutes = nextDouble(cumulativeScoresMinutes.last())
        val index = cumulativeScoresMinutes.indexOfLast { randomScoreMinutes < it }
        return parents[index]
    }
}
