package org.example.schwimmen.util

import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

fun parseZeit(time: String): Duration {
    val (minutes, seconds) = time.trim().split(":")
    return minutes.toInt().minutes + seconds.replace(",", ".").toDouble().seconds
}

fun formatZeit(time: Duration): String =
    time.toComponents { minutes, seconds, nanoseconds ->
        "$minutes:$seconds,${nanoseconds / 1_000_000_000}"
    }
