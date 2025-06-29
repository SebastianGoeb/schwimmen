export interface Progress {
  duration: number;
  checked: number;
  history: HistoryEntry[][];
}

export interface HistoryEntry {
  score: number;
  hash: string;
  state: number[];
}
