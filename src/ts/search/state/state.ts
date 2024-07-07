export interface State {
  teams: Team[];
}

export interface Team {
  staffelBelegungen: StaffelBelegung[];
}

export interface StaffelBelegung {
  staffelId: number; // TODO do we need this?
  startBelegungen: number[];
}
