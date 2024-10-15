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
    },
    {
      id: 1,
      name: "Kraul",
      legs: [{ disciplineId: 1, times: 4 }],
    },
    {
      id: 2,
      name: "Rücken",
      legs: [{ disciplineId: 2, times: 4 }],
    },
    {
      id: 3,
      name: "Lagen",
      legs: [
        { disciplineId: 0, times: 2 },
        { disciplineId: 1, times: 2 },
        { disciplineId: 2, times: 2 },
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
