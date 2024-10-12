import { Discipline } from "./discipline.ts";
import { Swimmer } from "./swimmer.ts";
import { Relay } from "./relay.ts";

export interface Data {
  disciplines: Discipline[];
  swimmers: Swimmer[];
  relays: Relay[];
}
