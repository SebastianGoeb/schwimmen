package org.example.schwimmen.model

data class Staffel(
    val name: String,
    val startDisziplinPaare: List<String>, // TODO maybe id?
    val team: Boolean,
)
