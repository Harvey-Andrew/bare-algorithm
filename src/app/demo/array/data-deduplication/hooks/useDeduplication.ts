'use client';

import { useCallback, useMemo, useState } from 'react';

import { CONFIG, generateMockRecords } from '../constants';
import { deduplicateByEmail } from '../services/dedup.api';
import type { DataRecord, PerformanceMetrics } from '../types';

export function useDeduplication() {
  const [records, setRecords] = useState<DataRecord[]>(() =>
    generateMockRecords(CONFIG.DEFAULT_COUNT)
  );

  const { result, dedupTime } = useMemo(() => {
    const { result, time } = deduplicateByEmail(records);
    return { result, dedupTime: time };
  }, [records]);

  const metrics: PerformanceMetrics = useMemo(
    () => ({
      dedupTime,
      originalCount: records.length,
      uniqueCount: result.unique.length,
      duplicateCount: result.duplicates.length,
    }),
    [dedupTime, records.length, result]
  );

  const regenerate = useCallback(() => {
    setRecords(generateMockRecords(CONFIG.DEFAULT_COUNT));
  }, []);

  return { records, result, metrics, regenerate };
}
