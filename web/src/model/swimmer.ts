import { Gender } from "./gender.ts";

export interface Swimmer {
  id: number;
  name: string;
  present: boolean;
  gender: Gender;
  minStarts?: number;
  maxStarts?: number;
  disciplineToSeconds: Map<number, number>;
}
