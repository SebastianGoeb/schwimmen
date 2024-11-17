import { StateCreator } from "zustand/index";
import { realData } from "../../demo/data.ts";
import { max } from "lodash-es";
import { LapTime, Swimmer } from "../../model/swimmer.ts";
import { Gender } from "../../model/gender.ts";
import { LapTimeImport } from "../../model/lap-time-import.ts";
import { formatMaskedTime } from "../../utils/masking.ts";
import { DisciplineSlice } from "./discipline.ts";

export const swimmerDefaults: Omit<Swimmer, "id"> = {
  name: "",
  yearOfBirth: new Date().getFullYear(),
  gender: Gender.M,
  present: true,
  lapTimes: new Map(),
  ageGroup: "Unbekannt",
};

export interface SwimmerSlice {
  swimmers: Map<number, Swimmer>;
  addSwimmer: () => void;
  removeSwimmer: (swimmerId: number) => void;
  updateSwimmer: (swimmer: Swimmer) => void;
  replaceAllSwimmers: (swimmers: Swimmer[]) => void;
  removeLapTime: (swimmer: Swimmer, disciplineId: number) => void;
  updateLapTime: (swimmer: Swimmer, disciplineId: number, lapTime: LapTime) => void;
  importLapTimes: (lapTimeImport: LapTimeImport) => void;
}

export const createSwimmerSlice: StateCreator<SwimmerSlice & DisciplineSlice, [], [], SwimmerSlice> = (set) => ({
  swimmers: new Map(realData.swimmers.map((s) => [s.id, s])),
  addSwimmer: () => set((state) => addSwimmer(state)),
  removeSwimmer: (swimmerId) => set((state) => removeSwimmer(state, swimmerId)),
  updateSwimmer: (swimmer) => set((state) => updateSwimmer(state, swimmer)),
  replaceAllSwimmers: (swimmers) => set((state) => replaceAllSwimmers(state, swimmers)),
  removeLapTime: (swimmer, disciplineId) => set((state) => removeLapTime(state, swimmer, disciplineId)),
  updateLapTime: (swimmer, disciplineId, lapTime) =>
    set((state) => updateLapTime(state, swimmer, disciplineId, lapTime)),
  importLapTimes: (lapTimeImport: LapTimeImport) => set((state) => importLapTimes(state, lapTimeImport)),
});

function addSwimmer(state: SwimmerSlice): Partial<SwimmerSlice> {
  const ids = Array.from(state.swimmers.keys());
  const swimmer: Swimmer = { ...swimmerDefaults, id: (max(ids) ?? 0) + 1 };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, swimmer) };
}

function removeSwimmer(state: SwimmerSlice, swimmerId: number): Partial<SwimmerSlice> {
  const newSwimmers = new Map(state.swimmers);
  newSwimmers.delete(swimmerId);
  return { swimmers: newSwimmers };
}

function updateSwimmer(state: SwimmerSlice, swimmer: Swimmer): Partial<SwimmerSlice> {
  return { swimmers: new Map(state.swimmers).set(swimmer.id, swimmer) };
}

function replaceAllSwimmers(_state: SwimmerSlice, swimmers: Swimmer[]): Partial<SwimmerSlice> {
  return { swimmers: new Map(swimmers.map((s) => [s.id, s])) };
}

function removeLapTime(state: SwimmerSlice, swimmer: Swimmer, disciplineId: number): Partial<SwimmerSlice> {
  const newLapTimes = new Map(swimmer.lapTimes);
  newLapTimes.delete(disciplineId);
  const newSwimmer: Swimmer = { ...swimmer, lapTimes: newLapTimes };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, newSwimmer) };
}

function updateLapTime(
  state: SwimmerSlice,
  swimmer: Swimmer,
  disciplineId: number,
  lapTime: LapTime,
): Partial<SwimmerSlice> {
  const newLapTimes = new Map(swimmer.lapTimes).set(disciplineId, lapTime);
  const newSwimmer: Swimmer = { ...swimmer, lapTimes: newLapTimes };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, newSwimmer) };
}

function importLapTimes(
  state: SwimmerSlice & DisciplineSlice,
  lapTimeImport: LapTimeImport,
): Partial<SwimmerSlice & DisciplineSlice> {
  // create new disciplines and update name-id map as we go
  const disciplineNameToId = new Map(lapTimeImport.disciplineNameToId);
  let maxDisciplineId = max(Array.from(state.disciplines, (it) => it.id)) ?? 0;
  const newDisciplines = [...state.disciplines];
  disciplineNameToId.forEach((id, name) => {
    if (id === -1) {
      const newId = ++maxDisciplineId;
      newDisciplines.push({ id: newId, name });
      disciplineNameToId.set(name, newId);
    }
  });

  // create new swimmers and update name-id map as we go
  const swimmerNameToId = new Map(lapTimeImport.swimmerNameToId);
  let maxSwimmerId = max(Array.from(state.swimmers.keys())) ?? 0;
  const newSwimmers = new Map(state.swimmers);
  swimmerNameToId.forEach((id, name) => {
    if (id === -1) {
      const newId = ++maxSwimmerId;
      newSwimmers.set(newId, { ...swimmerDefaults, id: newId, name });
      swimmerNameToId.set(name, newId);
    }
  });

  // set all the lap times, cloning everything necessary
  lapTimeImport.importedSchwimmer.forEach((schwimmer) => {
    const swimmerId = swimmerNameToId.get(schwimmer.name)!;
    const swimmer: Swimmer = { ...newSwimmers.get(swimmerId)! };
    swimmer.lapTimes = new Map(swimmer.lapTimes);
    schwimmer.zeitenSeconds.forEach((seconds, disciplineName) => {
      const disciplineId = disciplineNameToId.get(disciplineName)!;
      const enabled = swimmer.lapTimes.get(disciplineId)?.enabled ?? true;
      swimmer.lapTimes.set(disciplineId, { seconds: formatMaskedTime(seconds), enabled });
    });
    newSwimmers.set(swimmerId, swimmer);
  });

  return { disciplines: newDisciplines, swimmers: newSwimmers };
}
