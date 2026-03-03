'use client';

export interface DataItem {
  id: string;
  value: number;
  processed: boolean;
}

export interface ChunkResult {
  chunkIndex: number;
  itemCount: number;
  processTime: number;
  success: boolean;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'paused' | 'completed' | 'error';
  progress: number;
  processedCount: number;
  totalCount: number;
  currentChunk: number;
  totalChunks: number;
}

export interface PerformanceMetrics {
  totalTime: number;
  avgChunkTime: number;
  itemsPerSecond: number;
}
