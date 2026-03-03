'use client';

import { useCallback, useState } from 'react';

import { INITIAL_PAGES } from '../constants';
import type { HistoryPage } from '../types';

export function useBrowserHistory() {
  const [history, setHistory] = useState<HistoryPage[]>(INITIAL_PAGES);
  const [currentIndex, setCurrentIndex] = useState(INITIAL_PAGES.length - 1);

  const currentPage = history[currentIndex];

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goForward = useCallback(() => {
    setCurrentIndex((i) => Math.min(history.length - 1, i + 1));
  }, [history.length]);

  const visit = useCallback(
    (page: HistoryPage) => {
      setHistory((prev) => {
        // 截断前进历史
        const base = prev.slice(0, currentIndex + 1);
        return [...base, { ...page, id: Date.now().toString() }];
      });
      setCurrentIndex((i) => i + 1);
    },
    [currentIndex]
  );

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  return { history, currentIndex, currentPage, goBack, goForward, visit, canGoBack, canGoForward };
}
