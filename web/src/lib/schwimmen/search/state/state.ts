export interface State {
  teams: TeamState[];
}

export interface TeamState {
  relays: RelayState[];
}

export interface RelayState {
  swimmerIndices: number[];
}
