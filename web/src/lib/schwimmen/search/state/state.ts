// TODO do this differently / without a wrapper object
export interface StateAndScore {
  state: State;
  score: number;
}

export interface State {
  teams: TeamState[];
}

export interface TeamState {
  relays: RelayState[];
}

export interface RelayState {
  swimmerIndices: number[];
}
