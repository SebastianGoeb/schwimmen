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
}

export interface LapTime {
  seconds: string;
  enabled: boolean;
}
