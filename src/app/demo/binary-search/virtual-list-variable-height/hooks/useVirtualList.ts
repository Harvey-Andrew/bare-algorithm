'use client';

import { useCallback, useMemo, useState } from 'react';

import { BUFFER_SIZE, generateItems, ITEM_COUNT, VIEWPORT_HEIGHT } from '../constants';
import { buildPrefixSum, findStartIndex } from '../services/virtualList.api';
import type { ListItem, VisibleRange } from '../types';

export function useVirtualList() {
  const [items] = useState<ListItem[]>(() => generateItems(ITEM_COUNT));
  const [scrollTop, setScrollTop] = useState(0);

  const prefixSum = useMemo(() => buildPrefixSum(items.map((i) => i.height)), [items]);
  const totalHeight = prefixSum[prefixSum.length - 1];

  const visibleRange = useMemo((): VisibleRange => {
    const startIndex = Math.max(0, findStartIndex(prefixSum, scrollTop) - BUFFER_SIZE);
    let endIndex = startIndex;

    while (endIndex < items.length && prefixSum[endIndex] < scrollTop + VIEWPORT_HEIGHT + 200) {
      endIndex++;
    }
    endIndex = Math.min(items.length - 1, endIndex + BUFFER_SIZE);

    return { startIndex, endIndex, offset: prefixSum[startIndex] };
  }, [prefixSum, scrollTop, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    items,
    visibleItems,
    visibleRange,
    scrollTop,
    totalHeight,
    viewportHeight: VIEWPORT_HEIGHT,
    handleScroll,
  };
}
