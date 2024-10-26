import { Discipline } from "../../model/discipline.ts";
import { StateCreator } from "zustand";
import { realData } from "../../demo/data.ts";
import { max } from "lodash-es";
import { showProgrammingErrorNotification } from "../../utils/notifications.ts";

export interface DisciplineSlice {
  disciplines: Discipline[];
  addDiscipline: (discipline: Omit<Discipline, "id">) => void;
  removeDiscipline: (disciplineId: number) => void;
  updateDiscipline: (discipline: Discipline) => void;
  swapDisciplines: (indexDown: number) => void;
}

export const createDisciplineSlice: StateCreator<
  DisciplineSlice, //  & WhatSlice?
  [],
  [],
  DisciplineSlice
> = (set) => ({
  disciplines: [...realData.disciplines],
  addDiscipline: (discipline) => set((state) => addDiscipline(state, discipline)),
  removeDiscipline: (disciplineId) => set((state) => removeDiscipline(state, disciplineId)),
  updateDiscipline: (discipline) => set((state) => updateDiscipline(state, discipline)),
  swapDisciplines: (indexDown) => set((state) => swapDiscipline(state, indexDown)),
});

function addDiscipline(state: DisciplineSlice, discipline: Omit<Discipline, "id">): Partial<DisciplineSlice> {
  const ids = Array.from(state.disciplines.keys());
  const newId = (max(ids) ?? 0) + 1;
  const newDisciplines = [...state.disciplines];
  newDisciplines.push({ ...discipline, id: newId });
  return { disciplines: newDisciplines };
}

function removeDiscipline(state: DisciplineSlice, disciplineId: number): Partial<DisciplineSlice> {
  const newDisciplines = [...state.disciplines];
  const index = newDisciplines.findIndex((d) => d.id === disciplineId);
  newDisciplines.splice(index, 1);
  return { disciplines: newDisciplines };
}

function updateDiscipline(state: DisciplineSlice, discipline: Discipline): Partial<DisciplineSlice> {
  const newDisciplines = [...state.disciplines];
  const index = newDisciplines.findIndex((d) => d.id === discipline.id);
  newDisciplines[index] = discipline;
  return { disciplines: newDisciplines };
}

function swapDiscipline(state: DisciplineSlice, indexDown: number): Partial<DisciplineSlice> {
  if (indexDown < 0 || indexDown >= state.disciplines.length - 1) {
    showProgrammingErrorNotification();
    return {};
  }

  const newDisciplines = [...state.disciplines];
  const temp = newDisciplines[indexDown];
  newDisciplines[indexDown] = newDisciplines[indexDown + 1];
  newDisciplines[indexDown + 1] = temp;
  return { disciplines: newDisciplines };
}
