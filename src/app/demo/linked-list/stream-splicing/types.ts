export interface StreamChunk {
  id: number;
  data: string;
  sequence: number;
  timestamp: number;
}

export interface StreamState {
  chunks: StreamChunk[];
  assembled: string;
}
