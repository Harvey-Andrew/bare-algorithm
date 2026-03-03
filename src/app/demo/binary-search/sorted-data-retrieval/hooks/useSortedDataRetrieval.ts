'use client';

import { useCallback, useMemo, useState } from 'react';

import { DATA_SIZE, generateSortedData } from '../constants';
import type { DataItem, SearchResult } from '../types';

function binarySearch(data: DataItem[], target: number): SearchResult {
  let left = 0;
  let right = data.length - 1;
  let comparisons = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    if (data[mid].value === target) {
      return { index: mid, item: data[mid], comparisons };
    } else if (data[mid].value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return { index: -1, item: null, comparisons };
}

function linearSearch(data: DataItem[], target: number): SearchResult {
  for (let i = 0; i < data.length; i++) {
    if (data[i].value === target) {
      return { index: i, item: data[i], comparisons: i + 1 };
    }
    if (data[i].value > target) {
      return { index: -1, item: null, comparisons: i + 1 };
    }
  }
  return { index: -1, item: null, comparisons: data.length };
}

export function useSortedDataRetrieval() {
  const [data] = useState<DataItem[]>(() => generateSortedData(DATA_SIZE));
  const [searchValue, setSearchValue] = useState(5000);
  const [binaryResult, setBinaryResult] = useState<SearchResult | null>(null);
  const [linearResult, setLinearResult] = useState<SearchResult | null>(null);

  const search = useCallback(() => {
    const br = binarySearch(data, searchValue);
    const lr = linearSearch(data, searchValue);
    setBinaryResult(br);
    setLinearResult(lr);
  }, [data, searchValue]);

  const maxValue = useMemo(() => data[data.length - 1]?.value || 10000, [data]);

  return { data, searchValue, setSearchValue, binaryResult, linearResult, search, maxValue };
}
