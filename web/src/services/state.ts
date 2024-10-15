import { Discipline } from "../model/discipline.ts";
import { LapTime, Swimmer } from "../model/swimmer.ts";
import { create } from "zustand";
import { Data } from "../model/data.ts";
import { max } from "lodash-es";
import { Gender } from "../model/gender.ts";
import { Relay, RelayLeg } from "../model/relay.ts";
import { showProgrammingErrorNotification } from "../utils/notifications.ts";
import { demoData1 } from "../demo/data.ts";

interface State {
  disciplines: Discipline[];
  swimmers: Map<number, Swimmer>;
  relays: Map<number, Relay>;
  // demo
  updateEverything: (data: Data) => void;
  // discipline
  addDiscipline: (discipline: Omit<Discipline, "id">) => void;
  removeDiscipline: (disciplineId: number) => void;
  updateDiscipline: (discipline: Discipline) => void;
  swapDisciplines: (indexDown: number) => void;
  // swimmer
  addSwimmer: () => void;
  removeSwimmer: (swimmerId: number) => void;
  updateSwimmer: (swimmer: Swimmer) => void;
  // lap time
  removeLapTime: (swimmer: Swimmer, disciplineId: number) => void;
  updateLapTime: (swimmer: Swimmer, disciplineId: number, lapTime: LapTime) => void;
  // relay
  addRelay: () => void;
  removeRelay: (relayId: number) => void;
  updateRelay: (relay: Relay) => void;
  // relay legs
  addRelayLeg: (relayId: number, relayLeg: RelayLeg) => void;
  removeRelayLeg: (relayId: number, index: number) => void;
  updateRelayLeg: (relayId: number, relayLeg: RelayLeg, index: number) => void;
}

export const useStore = create<State>()((set) => ({
  disciplines: [...demoData1.disciplines],
  swimmers: new Map(demoData1.swimmers.map((s) => [s.id, s])),
  relays: new Map(demoData1.relays.map((r) => [r.id, r])),
  // demo
  updateEverything: (data) => set((state) => updateEverything(state, data)),

  // discipline
  addDiscipline: (discipline) => set((state) => addDiscipline(state, discipline)),
  removeDiscipline: (disciplineId) => set((state) => removeDiscipline(state, disciplineId)),
  updateDiscipline: (discipline) => set((state) => updateDiscipline(state, discipline)),
  swapDisciplines: (indexDown) => set((state) => swapDiscipline(state, indexDown)),

  // swimmer
  addSwimmer: () => set((state) => addSwimmer(state)),
  removeSwimmer: (swimmerId) => set((state) => removeSwimmer(state, swimmerId)),
  updateSwimmer: (swimmer) => set((state) => updateSwimmer(state, swimmer)),

  // lap time
  removeLapTime: (swimmer, disciplineId) => set((state) => removeLapTime(state, swimmer, disciplineId)),
  updateLapTime: (swimmer, disciplineId, lapTime) =>
    set((state) => updateLapTime(state, swimmer, disciplineId, lapTime)),

  // relay
  addRelay: () => set((state) => addRelay(state)),
  removeRelay: (relayId) => set((state) => removeRelay(state, relayId)),
  updateRelay: (relay) => set((state) => updateRelay(state, relay)),

  // relay leg
  addRelayLeg: (relayId, relayLeg) => set((state) => addRelayLeg(state, relayId, relayLeg)),
  removeRelayLeg: (relayId, index) => set((state) => removeRelayLeg(state, relayId, index)),
  updateRelayLeg: (relayId, relayLeg, index) => set((state) => updateRelayLeg(state, relayId, relayLeg, index)),
}));

// ==== demo ====

function updateEverything(_state: State, data: Data): Partial<State> {
  return {
    disciplines: [...data.disciplines],
    swimmers: new Map(data.swimmers.map((swimmer: Swimmer) => [swimmer.id, swimmer])),
    relays: new Map(data.relays.map((relay: Relay) => [relay.id, relay])),
  };
}

// ==== discipline ====

function addDiscipline(state: State, discipline: Omit<Discipline, "id">): Partial<State> {
  const ids = Array.from(state.disciplines.keys());
  const newId = (max(ids) ?? 0) + 1;
  const newDisciplines = [...state.disciplines];
  newDisciplines.push({ ...discipline, id: newId });
  return { disciplines: newDisciplines };
}

function removeDiscipline(state: State, disciplineId: number): Partial<State> {
  const newDisciplines = [...state.disciplines];
  const index = newDisciplines.findIndex((d) => d.id === disciplineId);
  newDisciplines.splice(index, 1);
  return { disciplines: newDisciplines };
}

function updateDiscipline(state: State, discipline: Discipline): Partial<State> {
  const newDisciplines = [...state.disciplines];
  const index = newDisciplines.findIndex((d) => d.id === discipline.id);
  newDisciplines[index] = discipline;
  return { disciplines: newDisciplines };
}

function swapDiscipline(state: State, indexDown: number): Partial<State> {
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

// ==== swimmer ====

function addSwimmer(state: State): Partial<State> {
  const ids = Array.from(state.swimmers.keys());
  const swimmer: Swimmer = {
    id: (max(ids) ?? 0) + 1,
    name: "",
    yearOfBirth: new Date().getFullYear(),
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

// ==== lap time ====

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

// ==== relay ====

function addRelay(state: State): Partial<State> {
  const ids = Array.from(state.relays.keys());
  const relay: Relay = {
    id: (max(ids) ?? 0) + 1,
    name: "",
    legs: [],
  };
  return { relays: new Map(state.relays).set(relay.id, relay) };
}

function removeRelay(state: State, relayId: number): Partial<State> {
  const newRelays = new Map(state.relays);
  newRelays.delete(relayId);
  return { relays: newRelays };
}

function updateRelay(state: State, relay: Relay): Partial<State> {
  return { relays: new Map(state.relays).set(relay.id, relay) };
}

// ==== relay leg ====

function addRelayLeg(state: State, relayId: number, relayLeg: RelayLeg): Partial<State> {
  const relay = state.relays.get(relayId);
  if (relay === undefined) {
    showProgrammingErrorNotification();
    return {};
  }
  const newLegs = Array.from(relay.legs);
  newLegs.push(relayLeg);
  const newRelay: Relay = { ...relay, legs: newLegs };

  // set default relay name if a name hasn't already been chosen
  if (newRelay.name === "") {
    const discipline = state.disciplines.find((d) => d.id === relayLeg.disciplineId);
    if (discipline === undefined) {
      showProgrammingErrorNotification();
      return {};
    }
    newRelay.name = discipline.name;
  }
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}

function removeRelayLeg(state: State, relayId: number, index: number): Partial<State> {
  const relay = state.relays.get(relayId);
  if (relay === undefined) {
    showProgrammingErrorNotification();
    return {};
  }
  const newLegs = Array.from(relay.legs);
  newLegs.splice(index, 1);
  const newRelay: Relay = { ...relay, legs: newLegs };
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}

function updateRelayLeg(state: State, relayId: number, relayLeg: RelayLeg, index: number): Partial<State> {
  const relay = state.relays.get(relayId);
  if (relay === undefined) {
    showProgrammingErrorNotification();
    return {};
  }
  const newLegs = Array.from(relay.legs);
  newLegs[index] = relayLeg;
  const newRelay: Relay = { ...relay, legs: newLegs };
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}
