import { Discipline } from "../model/discipline.ts";
import { LapTime, Swimmer } from "../model/swimmer.ts";
import { create } from "zustand";
import { Data } from "../model/data.ts";
import { max } from "lodash-es";
import { Gender } from "../model/gender.ts";
import { Relay } from "../model/relay.ts";

interface State {
  disciplines: Map<number, Discipline>;
  swimmers: Map<number, Swimmer>;
  relays: Map<number, Relay>;
  updateEverything: (data: Data) => void;
  updateDiscipline: (discipline: Discipline) => void;
  addSwimmer: () => void;
  removeSwimmer: (swimmerId: number) => void;
  updateSwimmer: (swimmer: Swimmer) => void;
  removeLapTime: (swimmer: Swimmer, disciplineId: number) => void;
  updateLapTime: (swimmer: Swimmer, disciplineId: number, lapTime: LapTime) => void;
}

export const useStore = create<State>()((set) => ({
  disciplines: new Map(
    [
      { id: 0, name: "Disziplin 1" },
      { id: 1, name: "Disziplin 2" },
      { id: 2, name: "Disziplin 3" },
    ].map((it) => [it.id, it]),
  ),
  swimmers: new Map(),
  relays: new Map(),
  updateEverything: (data) => set((state) => updateEverything(state, data)),
  updateDiscipline: (discipline) => set((state) => updateDiscipline(state, discipline)),
  addSwimmer: () => set((state) => addSwimmer(state)),
  removeSwimmer: (swimmerId) => set((state) => removeSwimmer(state, swimmerId)),
  updateSwimmer: (swimmer) => set((state) => updateSwimmer(state, swimmer)),
  removeLapTime: (swimmer, disciplineId) => set((state) => removeLapTime(state, swimmer, disciplineId)),
  updateLapTime: (swimmer, disciplineId, lapTime) =>
    set((state) => updateLapTime(state, swimmer, disciplineId, lapTime)),
}));

function updateEverything(_state: State, data: Data): Partial<State> {
  return {
    disciplines: new Map(data.disciplines.map((discipline: Discipline) => [discipline.id, discipline])),
    swimmers: new Map(data.swimmers.map((swimmer: Swimmer) => [swimmer.id, swimmer])),
    relays: new Map(data.relays.map((relay: Relay) => [relay.id, relay])),
  };
}

function updateDiscipline(state: State, discipline: Discipline): Partial<State> {
  return { disciplines: new Map(state.disciplines).set(discipline.id, discipline) };
}

function addSwimmer(state: State): Partial<State> {
  const ids = Array.from(state.swimmers.keys());
  const swimmer: Swimmer = {
    id: (max(ids) ?? 0) + 1,
    name: "",
    gender: Gender.M,
    present: true,
    lapTimes: new Map(),
  };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, swimmer) };
}

function removeSwimmer(state: State, swimmerId: number): Partial<State> {
  const newSwimmers = new Map(state.swimmers);
  newSwimmers.delete(swimmerId);
  return { swimmers: newSwimmers };
}

function updateSwimmer(state: State, swimmer: Swimmer): Partial<State> {
  return { swimmers: new Map(state.swimmers).set(swimmer.id, swimmer) };
}

function removeLapTime(state: State, swimmer: Swimmer, disciplineId: number) {
  const newLapTimes = new Map(swimmer.lapTimes);
  newLapTimes.delete(disciplineId);
  const newSwimmer: Swimmer = { ...swimmer, lapTimes: newLapTimes };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, newSwimmer) };
}

function updateLapTime(state: State, swimmer: Swimmer, disciplineId: number, lapTime: LapTime) {
  const newLapTimes = new Map(swimmer.lapTimes).set(disciplineId, lapTime);
  const newSwimmer: Swimmer = { ...swimmer, lapTimes: newLapTimes };
  return { swimmers: new Map(state.swimmers).set(swimmer.id, newSwimmer) };
}
