export interface Meeting {
  id: string;
  name: string;
  start: number;
  end: number;
}

export interface ScheduleResult {
  selected: Meeting[];
  rejected: Meeting[];
}
