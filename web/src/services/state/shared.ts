import { StateCreator } from "zustand/index";
import { realData } from "../../demo/data.ts";
import { Swimmer } from "../../model/swimmer.ts";
import { DisciplineSlice } from "./discipline.ts";
import { Data } from "../../model/data.ts";
import { Relay } from "../../model/relay.ts";
import { SwimmerSlice } from "./swimmer.ts";
import { RelaySlice } from "./relay.ts";

export interface SharedSlice {
  updateEverything: (data: Data) => void;
}

type CombinedSlice = SharedSlice & DisciplineSlice & SwimmerSlice & RelaySlice;

export const createSharedSlice: StateCreator<CombinedSlice, [], [], SharedSlice> = (set) => ({
  swimmers: new Map(realData.swimmers.map((s) => [s.id, s])),
  updateEverything: (data) => set((state) => updateEverything(state, data)),
});

function updateEverything(_state: CombinedSlice, data: Data): Partial<CombinedSlice> {
  return {
    disciplines: [...data.disciplines],
    swimmers: new Map(data.swimmers.map((swimmer: Swimmer) => [swimmer.id, swimmer])),
    relays: new Map(data.relays.map((relay: Relay) => [relay.id, relay])),
  };
}
