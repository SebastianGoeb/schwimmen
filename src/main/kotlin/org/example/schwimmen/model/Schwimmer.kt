package org.example.schwimmen.model

import kotlin.time.Duration

data class Schwimmer(
    val name: String,
    val zeiten: Map<String, Duration>,
)

data class SchwimmerZeit(
    val name: String,
    val zeit: Duration,
)

data class StilZeit(
    val stil: String,
    val zeit: Duration,
)

data class SchwimmerStil(
    val name: String,
    val stil: String,
)
