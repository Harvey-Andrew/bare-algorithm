'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_DIMENSIONS } from '../constants';
import { calculateTotalCombinations, generateCombinations } from '../services/sku.api';
import type { FilterDimension, GenerationResult } from '../types';

export function useMultiDimFilter() {
  const [dimensions, setDimensions] = useState<FilterDimension[]>(DEFAULT_DIMENSIONS);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const expectedCount = calculateTotalCombinations(dimensions);

  const generate = useCallback(() => {
    const res = generateCombinations(dimensions);
    setResult(res);
  }, [dimensions]);

  const addOption = useCallback((dimIndex: number, option: string) => {
    setDimensions((prev) =>
      prev.map((d, i) => (i === dimIndex ? { ...d, options: [...d.options, option] } : d))
    );
    setResult(null);
  }, []);

  const removeOption = useCallback((dimIndex: number, optIndex: number) => {
    setDimensions((prev) =>
      prev.map((d, i) =>
        i === dimIndex ? { ...d, options: d.options.filter((_, j) => j !== optIndex) } : d
      )
    );
    setResult(null);
  }, []);

  const reset = useCallback(() => {
    setDimensions(DEFAULT_DIMENSIONS);
    setResult(null);
  }, []);

  return { dimensions, result, expectedCount, generate, addOption, removeOption, reset };
}
