import type { DataRecord, DeduplicationResult } from '../types';

export function deduplicateByEmail(records: DataRecord[]): {
  result: DeduplicationResult;
  time: number;
} {
  const start = performance.now();

  const seen = new Map<string, DataRecord>();
  const duplicateGroups = new Map<string, DataRecord[]>();
  const duplicates: DataRecord[] = [];

  for (const record of records) {
    const key = record.email.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(record);
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, [seen.get(key)!]);
      }
      duplicateGroups.get(key)!.push(record);
    } else {
      seen.set(key, record);
    }
  }

  return {
    result: {
      unique: Array.from(seen.values()),
      duplicates,
      duplicateGroups,
    },
    time: performance.now() - start,
  };
}
