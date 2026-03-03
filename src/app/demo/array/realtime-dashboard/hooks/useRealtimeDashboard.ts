'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { CONFIG, generateInitialMetrics, updateMetrics } from '../constants';
import type { MetricData, PerformanceMetrics } from '../types';

export function useRealtimeDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>(generateInitialMetrics);
  const [isLive, setIsLive] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [avgUpdateTime, setAvgUpdateTime] = useState(0);

  const updateTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const start = performance.now();
      setMetrics((prev) => updateMetrics(prev));
      const elapsed = performance.now() - start;

      updateTimes.current = [...updateTimes.current.slice(-19), elapsed];
      setUpdateCount((c) => c + 1);
      setLastUpdateTime(Date.now());

      // 在 effect 中计算并更新 avgUpdateTime
      const times = updateTimes.current;
      const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      setAvgUpdateTime(avg);
    }, CONFIG.UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLive]);

  const performanceMetrics: PerformanceMetrics = {
    updateCount,
    avgUpdateTime,
  };

  const toggleLive = useCallback(() => setIsLive((prev) => !prev), []);

  return { metrics, isLive, lastUpdateTime, performanceMetrics, toggleLive };
}
