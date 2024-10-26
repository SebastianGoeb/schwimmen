import { StateCreator } from "zustand/index";
import { realData } from "../../demo/data.ts";
import { max } from "lodash-es";
import { Relay, RelayLeg } from "../../model/relay.ts";
import { showProgrammingErrorNotification } from "../../utils/notifications.ts";
import { DisciplineSlice } from "./discipline.ts";

export interface RelaySlice {
  relays: Map<number, Relay>;
  addRelay: () => void;
  removeRelay: (relayId: number) => void;
  updateRelay: (relay: Relay) => void;
  addRelayLeg: (relayId: number, relayLeg: RelayLeg) => void;
  removeRelayLeg: (relayId: number, index: number) => void;
  updateRelayLeg: (relayId: number, relayLeg: RelayLeg, index: number) => void;
}

export const createRelaySlice: StateCreator<RelaySlice & DisciplineSlice, [], [], RelaySlice> = (set) => ({
  relays: new Map(realData.relays.map((r) => [r.id, r])),
  addRelay: () => set((state) => addRelay(state)),
  removeRelay: (relayId) => set((state) => removeRelay(state, relayId)),
  updateRelay: (relay) => set((state) => updateRelay(state, relay)),

  // relay leg
  addRelayLeg: (relayId, relayLeg) => set((state) => addRelayLeg(state, relayId, relayLeg)),
  removeRelayLeg: (relayId, index) => set((state) => removeRelayLeg(state, relayId, index)),
  updateRelayLeg: (relayId, relayLeg, index) => set((state) => updateRelayLeg(state, relayId, relayLeg, index)),
});

function addRelay(state: RelaySlice): Partial<RelaySlice> {
  const ids = Array.from(state.relays.keys());
  const relay: Relay = {
    id: (max(ids) ?? 0) + 1,
    name: "",
    legs: [],
    team: true,
  };
  return { relays: new Map(state.relays).set(relay.id, relay) };
}

function removeRelay(state: RelaySlice, relayId: number): Partial<RelaySlice> {
  const newRelays = new Map(state.relays);
  newRelays.delete(relayId);
  return { relays: newRelays };
}

function updateRelay(state: RelaySlice, relay: Relay): Partial<RelaySlice> {
  return { relays: new Map(state.relays).set(relay.id, relay) };
}

// ==== relay leg ====

function addRelayLeg(state: RelaySlice & DisciplineSlice, relayId: number, relayLeg: RelayLeg): Partial<RelaySlice> {
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

function removeRelayLeg(state: RelaySlice, relayId: number, index: number): Partial<RelaySlice> {
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

function updateRelayLeg(state: RelaySlice, relayId: number, relayLeg: RelayLeg, index: number): Partial<RelaySlice> {
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
