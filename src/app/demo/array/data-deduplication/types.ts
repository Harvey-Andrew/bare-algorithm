'use client';

export interface DataRecord {
  id: string;
  email: string;
  name: string;
  phone: string;
  source: string;
}

export interface DeduplicationResult {
  unique: DataRecord[];
  duplicates: DataRecord[];
  duplicateGroups: Map<string, DataRecord[]>;
}

export interface PerformanceMetrics {
  dedupTime: number;
  originalCount: number;
  uniqueCount: number;
  duplicateCount: number;
}
