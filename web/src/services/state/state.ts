import { create } from "zustand";
import { createDisciplineSlice, DisciplineSlice } from "./discipline.ts";
import { createSwimmerSlice, swimmerDefaults, SwimmerSlice } from "./swimmer.ts";
import { createRelaySlice, RelaySlice } from "./relay.ts";
import { createSharedSlice, SharedSlice } from "./shared.ts";
import { createSettingsSlice, SettingsSlice } from "./settings.ts";
import { persist, StorageValue } from "zustand/middleware";
import { Swimmer } from "../../model/swimmer.ts";

export type CombinedState = SharedSlice & DisciplineSlice & SwimmerSlice & RelaySlice & SettingsSlice;

export const useCombinedStore = create<CombinedState>()(
  persist(
    (...a) => ({
      ...createSharedSlice(...a),
      ...createDisciplineSlice(...a),
      ...createSwimmerSlice(...a),
      ...createRelaySlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: "combined-store",
      storage: {
        getItem: (name): StorageValue<CombinedState> | null => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const existingValue = JSON.parse(str);
          return {
            ...existingValue,
            state: {
              ...existingValue.state,
              swimmers: new Map(
                (existingValue.state.swimmers as [number, Swimmer][]).map(([id, swimmer]) => [
                  id,
                  // ...swimmerDefaults is a hack to implement backwards compatible storage
                  // TODO implement real storage migration
                  { ...swimmerDefaults, ...swimmer, lapTimes: new Map(swimmer.lapTimes) },
                ]),
              ),
              relays: new Map(existingValue.state.relays),
            },
          };
        },
        setItem: (name, newValue: StorageValue<CombinedState>) => {
          // functions cannot be JSON encoded
          const str = JSON.stringify({
            ...newValue,
            state: {
              ...newValue.state,
              swimmers: Array.from(newValue.state.swimmers.entries(), ([id, swimmer]) => [
                id,
                { ...swimmer, lapTimes: Array.from(swimmer.lapTimes.entries()) },
              ]),
              relays: Array.from(newValue.state.relays.entries()),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
