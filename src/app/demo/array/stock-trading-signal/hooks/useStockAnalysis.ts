'use client';

import { useCallback, useMemo, useState } from 'react';

import { CONFIG, generateMockPrices, TIME_RANGE_DAYS } from '../constants';
import {
  calculateMaxProfit,
  calculateMovingAverages,
  deduplicatePrices,
  filterByTimeRange,
  generateTradeSignals,
} from '../services/stock.api';
import type { PerformanceMetrics, PricePoint, TimeRange } from '../types';

/**
 * 股票分析状态管理 Hook
 */
export function useStockAnalysis() {
  // 原始数据（懒初始化）
  const [rawPrices] = useState<PricePoint[]>(() => {
    const prices = generateMockPrices(CONFIG.DEFAULT_DAYS);
    return deduplicatePrices(prices);
  });

  // 时间范围
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  // 根据时间范围过滤数据
  const filteredPrices = useMemo(() => {
    return filterByTimeRange(rawPrices, TIME_RANGE_DAYS[timeRange]);
  }, [rawPrices, timeRange]);

  // 计算最大利润
  const { analysisResult, analysisTime } = useMemo(() => {
    const { result, calcTime } = calculateMaxProfit(filteredPrices);
    return { analysisResult: result, analysisTime: calcTime };
  }, [filteredPrices]);

  // 计算移动平均线
  const { maData, maCalcTime } = useMemo(() => {
    const { maData, calcTime } = calculateMovingAverages(filteredPrices);
    return { maData, maCalcTime: calcTime };
  }, [filteredPrices]);

  // 生成交易信号
  const tradeSignals = useMemo(() => {
    return generateTradeSignals(filteredPrices, maData);
  }, [filteredPrices, maData]);

  // 性能指标
  const metrics: PerformanceMetrics = useMemo(
    () => ({
      analysisTime,
      dataPoints: filteredPrices.length,
      maCalcTime,
    }),
    [analysisTime, filteredPrices.length, maCalcTime]
  );

  /**
   * 切换时间范围
   */
  const changeTimeRange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  return {
    // 数据
    prices: filteredPrices,
    maData,
    analysisResult,
    tradeSignals,
    metrics,

    // 配置
    timeRange,

    // 操作
    changeTimeRange,
  };
}
