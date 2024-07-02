package org.example.schwimmen.model

import kotlin.time.Duration

data class Schwimmer(
    val name: String,
    val zeiten: Map<String, Duration>,
)

data class Disziplin(
    val name: String,
)

data class StilZeit(
    val stil: String,
    val zeit: Duration,
)

data class StartBelegung(
    val schwimmerId: Int,
    val disziplinId: Int,
)

data class SchwimmerIdZeit(
    val schwimmerId: Int,
    val zeit: Duration,
)
