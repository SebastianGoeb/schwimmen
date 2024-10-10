import { Discipline } from "./discipline.ts";
import { Swimmer } from "./swimmer.ts";

export interface Data {
  disciplines: Discipline[];
  swimmers: Swimmer[];
}
