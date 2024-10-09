import { Discipline } from "../model/discipline.ts";
import { Swimmer } from "../model/swimmer.ts";
import { create } from "zustand";
import { Data } from "../model/data.ts";

interface State {
  disciplines: Map<number, Discipline>;
  swimmers: Map<number, Swimmer>;
  updateEverything: (data: Data) => void;
  updateDiscipline: (discipline: Discipline) => void;
  updateSwimmer: (swimmer: Swimmer) => void;
}

export const useStore = create<State>()((set) => ({
  disciplines: new Map(),
  swimmers: new Map(),
  updateEverything: (data: Data) => set((state) => updateEverything(state, data)),
  updateDiscipline: (discipline: Discipline) => set((state) => updateDiscipline(state, discipline)),
  updateSwimmer: (swimmer: Swimmer) => set((state) => updateSwimmer(state, swimmer)),
}));

function updateEverything(_state: State, data: Data): Partial<State> {
  return {
    disciplines: new Map(data.disciplines.map((discipline: Discipline) => [discipline.id, discipline])),
    swimmers: new Map(data.swimmers.map((swimmer: Swimmer) => [swimmer.id, swimmer])),
  };
}

function updateDiscipline(state: State, discipline: Discipline): Partial<State> {
  return { disciplines: new Map(state.disciplines).set(discipline.id, discipline) };
}

function updateSwimmer(state: State, swimmer: Swimmer): Partial<State> {
  return { swimmers: new Map(state.swimmers).set(swimmer.id, swimmer) };
}
