export interface TimeEvent {
  id: string;
  title: string;
  start: number;
  end: number;
}

export interface InsertResult {
  index: number;
  conflict: boolean;
  conflictWith?: TimeEvent;
}
