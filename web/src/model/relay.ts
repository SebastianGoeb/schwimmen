export interface Relay {
  id: number;
  name: string;
  legs: RelayLeg[];
  team: boolean;
}

export interface RelayLeg {
  disciplineId: number;
  times: number;
}
