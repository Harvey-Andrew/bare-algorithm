'use client';

import { useCallback, useState } from 'react';

import { MAX_CHUNK_SIZE, MIN_CHUNK_SIZE, simulateProcessTime, TARGET_TIME } from '../constants';
import type { OptimizationResult } from '../types';

export function useAnswerBinarySearch() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runOptimization = useCallback(async () => {
    setIsRunning(true);
    const history: OptimizationResult['history'] = [];

    let left = MIN_CHUNK_SIZE;
    let right = MAX_CHUNK_SIZE;
    let answer = left;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const processTime = simulateProcessTime(mid);
      const feasible = processTime <= TARGET_TIME;

      history.push({ value: mid, result: processTime, feasible });

      if (feasible) {
        answer = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }

      // 模拟延迟以便观察
      await new Promise((r) => setTimeout(r, 200));
      setResult({ optimalValue: answer, iterations: history.length, history: [...history] });
    }

    setResult({ optimalValue: answer, iterations: history.length, history });
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { result, isRunning, runOptimization, reset };
}
