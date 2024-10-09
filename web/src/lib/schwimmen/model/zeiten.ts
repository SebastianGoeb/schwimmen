export interface Zeiten {}

export interface Disziplin {
  id: number;
  name: string;
}

export interface Staffel {
  id: number;
  name: string;
  disziplinIds: number[];
}

export interface Schwimmer {
  id: number;
  name: string;
}
