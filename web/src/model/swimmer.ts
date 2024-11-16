import { Gender } from "./gender.ts";

export interface Swimmer {
  id: number;
  name: string;
  present: boolean;
  gender: Gender;
  yearOfBirth: number;
  minStarts?: number;
  maxStarts?: number;
  lapTimes: Map<number, LapTime>;
  ageGroup: string;
}

export interface LapTime {
  seconds: string;
  enabled: boolean;
}

export function compareByYearThenGenderThenLastname(a: Swimmer, b: Swimmer): number {
  if (a.yearOfBirth !== b.yearOfBirth) {
    return a.yearOfBirth - b.yearOfBirth;
  }

  if (a.gender !== b.gender) {
    // W dann M https://github.com/SebastianGoeb/schwimmen/issues/24
    return b.gender.localeCompare(a.gender);
  }

  const aLastname = a.name.split(" ").reverse()[0] ?? "";
  const bLastname = b.name.split(" ").reverse()[0] ?? "";
  return aLastname.localeCompare(bLastname);
}
