import { Gender } from "../model/gender.ts";
import { Data } from "../model/data.ts";

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
      ageGroup: "Junged E",
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
      ageGroup: "Junged E",
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
    acceptanceProbability: 0.1,
    globalGenerationLimit: 200,
    restartGenerationLimit: 50,
    maxGenerations: 1_000_000,
    populationSize: 20,
  },
};

export const realData: Data = {
  disciplines: [
    {
      id: 0,
      name: "Rücken",
    },
    {
      id: 1,
      name: "Brust",
    },
    {
      id: 2,
      name: "Kraul",
    },
    {
      name: "Rü Beine",
      id: 3,
    },
    {
      name: "Kr Beine",
      id: 4,
    },
    {
      name: "Br Beine",
      id: 5,
    },
    {
      name: "200",
      id: 6,
    },
    {
      name: "BrAr/KrBei",
      id: 7,
    },
  ],
  swimmers: [],
  relays: [
    {
      id: 0,
      name: "4 x Kraul",
      legs: [
        {
          disciplineId: 2,
          times: 4,
        },
      ],
      team: false,
    },
    {
      id: 1,
      name: "4 x Brust A Kr Beine",
      legs: [
        {
          disciplineId: 7,
          times: 4,
        },
      ],
      team: false,
    },
    {
      id: 2,
      name: "4 x Brust",
      legs: [
        {
          disciplineId: 1,
          times: 4,
        },
      ],
      team: false,
    },
    {
      id: 3,
      name: "6 x LG Beine",
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
      team: false,
    },
    {
      id: 4,
      name: "4 x Rücken",
      legs: [
        {
          disciplineId: 0,
          times: 4,
        },
      ],
      team: false,
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
      team: true,
    },
    {
      id: 6,
      name: "6 x LG",
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
    acceptanceProbability: 0.1,
    globalGenerationLimit: 200,
    restartGenerationLimit: 50,
    maxGenerations: 1_000_000,
    populationSize: 20,
  },
};
