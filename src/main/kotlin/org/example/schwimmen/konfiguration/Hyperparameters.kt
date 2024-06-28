package org.example.schwimmen.konfiguration

import org.example.schwimmen.suche.Ergebnis
import kotlin.time.Duration

data class Hyperparameters(
    val smartMutationRate: Double,
    val smartMutation: (Ergebnis) -> Pair<Ergebnis, Int>,
    val dumbMutation: (Ergebnis) -> Pair<Ergebnis, Int>,
    val timeout: Duration,
)
