export interface Relay {
  id: number;
  name: string;
  legs: RelayLeg[];
}

export interface RelayLeg {
  disciplineId: number;
  times: number;
}
