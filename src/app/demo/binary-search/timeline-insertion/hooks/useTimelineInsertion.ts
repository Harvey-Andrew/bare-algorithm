'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_EVENTS } from '../constants';
import type { InsertResult, TimeEvent } from '../types';

function findInsertPosition(events: TimeEvent[], start: number): number {
  let left = 0;
  let right = events.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (events[mid].start < start) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

function checkConflict(
  events: TimeEvent[],
  newEvent: TimeEvent,
  insertIdx: number
): TimeEvent | null {
  // 检查前一个事件
  if (insertIdx > 0 && events[insertIdx - 1].end > newEvent.start) {
    return events[insertIdx - 1];
  }
  // 检查后一个事件
  if (insertIdx < events.length && events[insertIdx].start < newEvent.end) {
    return events[insertIdx];
  }
  return null;
}

export function useTimelineInsertion() {
  const [events, setEvents] = useState<TimeEvent[]>(DEFAULT_EVENTS);
  const [newEvent, setNewEvent] = useState<TimeEvent>({ id: '', title: '', start: 10, end: 11 });
  const [lastResult, setLastResult] = useState<InsertResult | null>(null);

  const tryInsert = useCallback(() => {
    const insertIdx = findInsertPosition(events, newEvent.start);
    const conflict = checkConflict(events, newEvent, insertIdx);

    const result: InsertResult = {
      index: insertIdx,
      conflict: !!conflict,
      conflictWith: conflict || undefined,
    };
    setLastResult(result);

    if (!conflict && newEvent.title) {
      const eventToInsert = { ...newEvent, id: `e-${Date.now()}` };
      setEvents((prev) => [...prev.slice(0, insertIdx), eventToInsert, ...prev.slice(insertIdx)]);
      setNewEvent({ id: '', title: '', start: newEvent.end, end: newEvent.end + 1 });
    }
  }, [events, newEvent]);

  const reset = useCallback(() => {
    setEvents(DEFAULT_EVENTS);
    setLastResult(null);
  }, []);

  return { events, newEvent, setNewEvent, lastResult, tryInsert, reset };
}
