
plugins {
    kotlin("jvm") version "1.9.23"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

val kotlinCsvVersion = "1.9.3"
val kotestVersion = "5.9.0"

dependencies {
    implementation("com.github.doyaaaaaken:kotlin-csv-jvm:$kotlinCsvVersion")

    testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
    testImplementation(kotlin("test"))
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}
