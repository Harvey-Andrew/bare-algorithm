'use client';

import { useCallback, useMemo, useState } from 'react';

import { CONFIG, generateMockList, generateModifiedList } from '../constants';
import { computeDiff } from '../services/diff.api';
import type { Item, PerformanceMetrics } from '../types';

export function useDiff() {
  const [oldList, setOldList] = useState<Item[]>(() => generateMockList(CONFIG.DEFAULT_COUNT));
  const [newList, setNewList] = useState<Item[]>(() => generateModifiedList(oldList));

  const { result, diffTime } = useMemo(() => {
    const { result, time } = computeDiff(oldList, newList);
    return { result, diffTime: time };
  }, [oldList, newList]);

  const metrics: PerformanceMetrics = useMemo(
    () => ({
      diffTime,
      oldCount: oldList.length,
      newCount: newList.length,
    }),
    [diffTime, oldList.length, newList.length]
  );

  const regenerate = useCallback(() => {
    const newOld = generateMockList(CONFIG.DEFAULT_COUNT);
    setOldList(newOld);
    setNewList(generateModifiedList(newOld));
  }, []);

  return { oldList, newList, result, metrics, regenerate };
}
