import { create } from "zustand";
import { createDisciplineSlice, DisciplineSlice } from "./discipline.ts";
import { createSwimmerSlice, SwimmerSlice } from "./swimmer.ts";
import { createRelaySlice, RelaySlice } from "./relay.ts";
import { createSharedSlice, SharedSlice } from "./shared.ts";
import { createSettingsSlice, SettingsSlice } from "./settings.ts";

export type CombinedState = SharedSlice & DisciplineSlice & SwimmerSlice & RelaySlice & SettingsSlice;

export const useCombinedStore = create<CombinedState>()((...a) => ({
  ...createSharedSlice(...a),
  ...createDisciplineSlice(...a),
  ...createSwimmerSlice(...a),
  ...createRelaySlice(...a),
  ...createSettingsSlice(...a),
}));
