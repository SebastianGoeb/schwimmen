export function parseGeschlechter(data: string): Map<string, Geschlecht> {
    return parseGeschlechterFromGrid(data.split("\n").map(row => row.split("\t")));
}

export function parseGeschlechterFromGrid(rows: string[][]): Map<string, Geschlecht> {
    return new Map<string, Geschlecht>(rows
        .filter(row => row.length >= 2 && !isBlank(row[0]) && !isBlank(row[1]))
        .map(row => [row[0], toGeschlecht(row[1])]))
}

function toGeschlecht(it: string): Geschlecht {
    if (it === "m") {
        return Geschlecht.MALE;
    } else if (it == "w") {
        return Geschlecht.FEMALE;
    } else {
        throw Error(`Unbekanntes Geschlecht ${it}`);
    }
}

enum  Geschlecht {
    MALE,
    FEMALE,
}

function isBlank(s: string): boolean {
    return s.trim().length == 0
}