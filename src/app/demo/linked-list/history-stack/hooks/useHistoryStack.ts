'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_CONTENT, MAX_HISTORY_LENGTH } from '../constants';
import type { HistoryEntry } from '../types';

export function useHistoryStack() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { id: 0, content: DEFAULT_CONTENT, timestamp: 0 },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentContent = history[currentIndex]?.content ?? '';

  const push = useCallback(
    (content: string) => {
      setHistory((prev) => {
        // 如果不在最新位置，截断后续历史
        const base = prev.slice(0, currentIndex + 1);
        const newEntry: HistoryEntry = { id: Date.now(), content, timestamp: Date.now() };
        let next = [...base, newEntry];
        // 限制历史长度
        if (next.length > MAX_HISTORY_LENGTH) {
          next = next.slice(next.length - MAX_HISTORY_LENGTH);
        }
        setCurrentIndex(next.length - 1);
        return next;
      });
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((i) => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    currentContent,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
