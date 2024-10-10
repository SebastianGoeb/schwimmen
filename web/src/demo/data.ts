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
      gender: Gender.M,
      present: true,
      lapTimes: new Map([
        [0, { seconds: 5.5, enabled: true }],
        [2, { seconds: 25.5, enabled: true }],
      ]),
    },
    {
      id: 1,
      name: "Erika Mustermann",
      gender: Gender.W,
      present: false,
      minStarts: 1,
      maxStarts: 2,
      lapTimes: new Map([
        [0, { seconds: 23, enabled: false }],
        [1, { seconds: 13, enabled: true }],
        [2, { seconds: 3, enabled: true }],
      ]),
    },
  ],
};
