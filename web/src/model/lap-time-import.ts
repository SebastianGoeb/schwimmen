import { Schwimmer } from "../lib/schwimmen/eingabe/zeiten.ts";

export interface LapTimeImport {
  importedSchwimmer: Schwimmer[];
  swimmerNameToId: Map<string, number>;
  disciplineNameToId: Map<string, number>;
}
