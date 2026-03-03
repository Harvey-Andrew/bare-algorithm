'use client';

import { useCallback, useMemo, useState } from 'react';

import { aggregateToTimeBuckets, CONFIG, generateMockEvents } from '../constants';
import {
  batchUpdate,
  buildPrefixSum,
  calculateMetrics,
  rangeQuery,
} from '../services/analytics.api';
import type { PerformanceMetrics, RangeQueryResult, TimeBucket } from '../types';

const initialMetrics: PerformanceMetrics = {
  prefixSumBuildTime: 0,
  lastQueryTime: 0,
  totalEvents: 0,
  memoryUsage: 0,
};

/**
 * 图表分析状态管理 Hook
 */
export function useChartAnalytics() {
  // 使用懒初始化避免 useEffect 中的 setState
  const [buckets, setBuckets] = useState<TimeBucket[]>(() => {
    const events = generateMockEvents(CONFIG.DATA_RETENTION_HOURS);
    return aggregateToTimeBuckets(events);
  });
  const [queryResult, setQueryResult] = useState<RangeQueryResult | null>(null);
  const [selectedRange, setSelectedRange] = useState<[number, number]>(() => {
    const events = generateMockEvents(CONFIG.DATA_RETENTION_HOURS);
    const aggregated = aggregateToTimeBuckets(events);
    return [0, Math.min(9, aggregated.length - 1)];
  });
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics);
  const isLoading = buckets.length === 0;

  // 构建前缀和
  const { amountPrefix, countPrefix, buildTime } = useMemo(() => {
    if (buckets.length === 0) {
      return { amountPrefix: [0], countPrefix: [0], buildTime: 0 };
    }
    return buildPrefixSum(buckets);
  }, [buckets]);

  // 计算指标 (使用 useMemo 避免 useEffect 中 setState)
  const derivedMetrics = useMemo(() => {
    if (buckets.length === 0) return initialMetrics;
    return calculateMetrics(buckets, buildTime, metrics.lastQueryTime);
  }, [buckets, buildTime, metrics.lastQueryTime]);

  /**
   * 执行区间查询
   */
  const executeQuery = useCallback(
    (startIdx: number, endIdx: number) => {
      if (buckets.length === 0) return;

      const { result, queryTime } = rangeQuery(
        buckets,
        amountPrefix,
        countPrefix,
        startIdx,
        endIdx
      );

      setQueryResult(result);
      setSelectedRange([startIdx, endIdx]);
      setMetrics((prev) => ({ ...prev, lastQueryTime: queryTime }));
    },
    [buckets, amountPrefix, countPrefix]
  );

  /**
   * 批量调整金额
   */
  const applyBatchUpdate = useCallback(
    (startIdx: number, endIdx: number, delta: number) => {
      const { updatedBuckets } = batchUpdate(buckets, [
        { startIndex: startIdx, endIndex: endIdx, delta },
      ]);
      setBuckets(updatedBuckets);
    },
    [buckets]
  );

  /**
   * 重置数据
   */
  const resetData = useCallback(() => {
    const events = generateMockEvents(CONFIG.DATA_RETENTION_HOURS);
    const aggregated = aggregateToTimeBuckets(events);
    setBuckets(aggregated);
    setQueryResult(null);
    if (aggregated.length > 0) {
      setSelectedRange([0, Math.min(9, aggregated.length - 1)]);
    }
  }, []);

  return {
    // 状态
    buckets,
    queryResult,
    selectedRange,
    metrics: derivedMetrics,
    isLoading,
    // 操作
    executeQuery,
    applyBatchUpdate,
    resetData,
    setSelectedRange,
  };
}
