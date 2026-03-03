'use client';

export interface Item {
  id: string;
  name: string;
}

export interface DiffResult {
  added: Item[];
  removed: Item[];
  unchanged: Item[];
}

export interface PerformanceMetrics {
  diffTime: number;
  oldCount: number;
  newCount: number;
}
