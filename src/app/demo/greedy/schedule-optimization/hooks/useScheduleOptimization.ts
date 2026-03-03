'use client';

import { useMemo } from 'react';

import { MOCK_MEETINGS } from '../constants';
import type { Meeting, ScheduleResult } from '../types';

function greedySchedule(meetings: Meeting[]): ScheduleResult {
  const sorted = [...meetings].sort((a, b) => a.end - b.end);
  const selected: Meeting[] = [];
  const rejected: Meeting[] = [];
  let lastEnd = 0;

  for (const m of sorted) {
    if (m.start >= lastEnd) {
      selected.push(m);
      lastEnd = m.end;
    } else {
      rejected.push(m);
    }
  }

  return { selected, rejected };
}

export function useScheduleOptimization() {
  const result = useMemo(() => greedySchedule(MOCK_MEETINGS), []);
  return { meetings: MOCK_MEETINGS, result };
}
