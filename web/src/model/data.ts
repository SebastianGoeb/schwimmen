import { Discipline } from "./discipline.ts";
import { Swimmer } from "./swimmer.ts";
import { Relay } from "./relay.ts";
import { TeamSettings } from "./team-settings.ts";
import { SimulatedAnnealingSettings } from "./simulated-annealing-settings.ts";

export interface Data {
  disciplines: Discipline[];
  swimmers: Swimmer[];
  relays: Relay[];
  teamSettings: TeamSettings;
  simulatedAnnealingSettings: SimulatedAnnealingSettings;
}
