import { StateCreator } from "zustand/index";
import { realData } from "../../demo/data.ts";
import { TeamSettings } from "../../model/team-settings.ts";
import { SimulatedAnnealingSettings } from "../../model/simulated-annealing-settings.ts";

export interface SettingsSlice {
  teamSettings: TeamSettings;
  simulatedAnnealingSettings: SimulatedAnnealingSettings;
  updateTeamSettings: (teamSettings: Partial<TeamSettings>) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  teamSettings: realData.teamSettings,
  simulatedAnnealingSettings: realData.simulatedAnnealingSettings,
  updateTeamSettings: (teamSettings: Partial<TeamSettings>) =>
    set((state) => ({ teamSettings: { ...state.teamSettings, ...teamSettings } })),
});
