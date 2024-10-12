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
        [0, { seconds: "00:05,5", enabled: true }],
        [2, { seconds: "00:25,5", enabled: true }],
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
        [0, { seconds: "00:23,0", enabled: false }],
        [1, { seconds: "00:13,0", enabled: true }],
        [2, { seconds: "00:03,0", enabled: true }],
      ]),
    },
  ],
  relays: [
    {
      id: 0,
      name: "Brust",
      disciplines: new Map([[0, 4]]),
    },
    {
      id: 1,
      name: "Kraul",
      disciplines: new Map([[1, 4]]),
    },
    {
      id: 2,
      name: "Rücken",
      disciplines: new Map([[2, 4]]),
    },
    {
      id: 3,
      name: "Lagen",
      disciplines: new Map([
        [0, 2],
        [1, 2],
        [2, 2],
      ]),
    },
  ],
};
