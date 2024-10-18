import { Gender } from "../model/gender.ts";
import { Data } from "../model/data.ts";
import { mutateRandom, mutateVerySmart } from "../lib/schwimmen/search/sa/mutation.ts";

export const demoData1: Data = {
  disciplines: [
    {
      id: 0,
      name: "Brust",
    },
    {
      id: 1,
      name: "Kraul",
    },
    {
      id: 2,
      name: "Rücken",
    },
  ],
  swimmers: [
    {
      id: 0,
      name: "Max Mustermann",
      yearOfBirth: 2020,
      gender: Gender.M,
      present: true,
      lapTimes: new Map([
        [0, { seconds: "00:05,50", enabled: true }],
        [2, { seconds: "00:25,50", enabled: true }],
      ]),
    },
    {
      id: 1,
      name: "Erika Mustermann",
      yearOfBirth: 2017,
      gender: Gender.W,
      present: false,
      minStarts: 1,
      maxStarts: 2,
      lapTimes: new Map([
        [0, { seconds: "00:23,00", enabled: false }],
        [1, { seconds: "00:13,07", enabled: true }],
        [2, { seconds: "00:03,00", enabled: true }],
      ]),
    },
  ],
  relays: [
    {
      id: 0,
      name: "Brust",
      legs: [{ disciplineId: 0, times: 4 }],
      team: false,
    },
    {
      id: 1,
      name: "Kraul",
      legs: [{ disciplineId: 1, times: 4 }],
      team: false,
    },
    {
      id: 2,
      name: "Rücken",
      legs: [{ disciplineId: 2, times: 4 }],
      team: false,
    },
    {
      id: 3,
      name: "Lagen",
      legs: [
        { disciplineId: 0, times: 2 },
        { disciplineId: 1, times: 2 },
        { disciplineId: 2, times: 2 },
      ],
      team: false,
    },
  ],
  teamSettings: {
    alleMuessenSchwimmen: false,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minStartsProSchwimmer: 0,
    maxStartsProSchwimmer: 5,
    anzahlTeams: 1,
    maxZeitspanneProStaffelSeconds: "00:10,00",
  },
  simulatedAnnealingSettings: {
    smartMutationRate: 0.85,
    smartMutation: mutateVerySmart,
    dumbMutation: mutateRandom,
    acceptanceProbability: 0.1,
    globalGenerationLimit: 200,
    restartGenerationLimit: 50,
    maxGenerations: 1_000_000,
    populationSize: 20,
  },
};

export const realDataFJugend: Data = {
  disciplines: [
    {
      id: 0,
      name: "25m Rücken",
    },
    {
      id: 1,
      name: "25m Brust",
    },
    {
      id: 2,
      name: "25m Kraul",
    },
    {
      name: "25m Rücken Beine",
      id: 3,
    },
    {
      name: "25m Kraul Beine",
      id: 4,
    },
    {
      name: "25m Brust Beine",
      id: 5,
    },
    {
      name: "200m Team",
      id: 6,
    },
    {
      name: "25m BrAr/KrBei",
      id: 7,
    },
  ],
  swimmers: [
    {
      id: 4,
      name: "Leo Tan",
      yearOfBirth: 2024,
      gender: Gender.M,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 6,
      name: "Arthur Kleber",
      yearOfBirth: 2024,
      gender: Gender.M,
      present: true,
      lapTimes: new Map(),
      maxStarts: 2,
    },
    {
      id: 8,
      name: "Marlene Trapper",
      yearOfBirth: 2024,
      gender: Gender.W,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 9,
      name: "Leonie Sophie Wiehlpütz",
      yearOfBirth: 2024,
      gender: Gender.W,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 11,
      name: "Benno Reimann",
      yearOfBirth: 2024,
      gender: Gender.M,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 12,
      name: "Marie Gädke",
      yearOfBirth: 2024,
      gender: Gender.W,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 15,
      name: "Sophie Neumann",
      yearOfBirth: 2024,
      gender: Gender.W,
      present: true,
      lapTimes: new Map(),
    },
    {
      id: 16,
      name: "Theo Kemmerer",
      yearOfBirth: 2024,
      gender: Gender.M,
      present: true,
      lapTimes: new Map(),
    },
  ],
  relays: [
    {
      id: 0,
      name: "4 x 25 Kraul",
      legs: [
        {
          disciplineId: 2,
          times: 4,
        },
      ],
    },
    {
      id: 1,
      name: "4 x 25 Brust A Kr Beine",
      legs: [
        {
          disciplineId: 7,
          times: 4,
        },
      ],
    },
    {
      id: 2,
      name: "4 x 25 Brust",
      legs: [
        {
          disciplineId: 1,
          times: 4,
        },
      ],
    },
    {
      id: 3,
      name: "6 x 25 LG Beine",
      legs: [
        {
          disciplineId: 3,
          times: 2,
        },
        {
          disciplineId: 5,
          times: 2,
        },
        {
          disciplineId: 4,
          times: 2,
        },
      ],
    },
    {
      id: 4,
      name: "4 x 25 Rücken",
      legs: [
        {
          disciplineId: 0,
          times: 4,
        },
      ],
    },
    {
      id: 5,
      name: "200 Team",
      legs: [
        {
          disciplineId: 6,
          times: 4,
        },
      ],
    },
    {
      id: 6,
      name: "6 x 25 LG",
      legs: [
        {
          disciplineId: 0,
          times: 2,
        },
        {
          disciplineId: 1,
          times: 2,
        },
        {
          disciplineId: 2,
          times: 2,
        },
      ],
    },
  ],
  teamSettings: {
    alleMuessenSchwimmen: false,
    minSchwimmerProTeam: 7,
    maxSchwimmerProTeam: 12,
    minMaleProTeam: 2,
    minFemaleProTeam: 2,
    minStartsProSchwimmer: 0,
    maxStartsProSchwimmer: 5,
    anzahlTeams: 1,
    maxZeitspanneProStaffelSeconds: "00:10,00",
  },
  simulatedAnnealingSettings: {
    smartMutationRate: 0.85,
    smartMutation: mutateVerySmart,
    dumbMutation: mutateRandom,
    acceptanceProbability: 0.1,
    globalGenerationLimit: 200,
    restartGenerationLimit: 50,
    maxGenerations: 1_000_000,
    populationSize: 20,
  },
};
