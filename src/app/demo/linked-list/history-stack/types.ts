export interface HistoryEntry {
  id: number;
  content: string;
  timestamp: number;
}

export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
}
