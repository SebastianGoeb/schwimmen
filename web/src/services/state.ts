import { Discipline } from "../model/discipline.ts";
import { LapTime, Swimmer } from "../model/swimmer.ts";
import { create } from "zustand";
import { Data } from "../model/data.ts";
import { max } from "lodash-es";
import { Gender } from "../model/gender.ts";
import { Relay, RelayLeg } from "../model/relay.ts";

interface State {
  disciplines: Map<number, Discipline>;
  swimmers: Map<number, Swimmer>;
  relays: Map<number, Relay>;
  // demo
  updateEverything: (data: Data) => void;
  // discipline
  updateDiscipline: (discipline: Discipline) => void;
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
  disciplines: new Map(
    [
      { id: 0, name: "Disziplin 1" },
      { id: 1, name: "Disziplin 2" },
      { id: 2, name: "Disziplin 3" },
    ].map((it) => [it.id, it]),
  ),
  swimmers: new Map(),
  relays: new Map(),
  // demo
  updateEverything: (data) => set((state) => updateEverything(state, data)),

  // discipline
  updateDiscipline: (discipline) => set((state) => updateDiscipline(state, discipline)),

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
    disciplines: new Map(data.disciplines.map((discipline: Discipline) => [discipline.id, discipline])),
    swimmers: new Map(data.swimmers.map((swimmer: Swimmer) => [swimmer.id, swimmer])),
    relays: new Map(data.relays.map((relay: Relay) => [relay.id, relay])),
  };
}

// ==== discipline ====

function updateDiscipline(state: State, discipline: Discipline): Partial<State> {
  return { disciplines: new Map(state.disciplines).set(discipline.id, discipline) };
}

// ==== swimmer ====

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
  // TODO no !
  const relay = state.relays.get(relayId)!;
  const newLegs = Array.from(relay.legs);
  newLegs.push(relayLeg);
  const newRelay: Relay = { ...relay, legs: newLegs };
  if (newRelay.name === "") {
    // TODO no !
    newRelay.name = state.disciplines.get(relayLeg.disciplineId)!.name;
  }
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}

function removeRelayLeg(state: State, relayId: number, index: number): Partial<State> {
  // TODO no !
  const relay = state.relays.get(relayId)!;
  const newLegs = Array.from(relay.legs);
  newLegs.splice(index, 1);
  const newRelay: Relay = { ...relay, legs: newLegs };
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}

function updateRelayLeg(state: State, relayId: number, relayLeg: RelayLeg, index: number): Partial<State> {
  // TODO no !
  const relay = state.relays.get(relayId)!;
  const newLegs = Array.from(relay.legs);
  newLegs[index] = relayLeg;
  const newRelay: Relay = { ...relay, legs: newLegs };
  return { relays: new Map(state.relays).set(relayId, newRelay) };
}
