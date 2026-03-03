'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { CONFIG, generateMockPlayers } from '../constants';
import { calculateRankChanges, getTopK, simulateScoreChange } from '../services/ranking.api';
import type { PerformanceMetrics, Player, RankEntry, TopKParams } from '../types';

/**
 * 排行榜状态管理 Hook
 */
export function useLeaderboard() {
  // 原始数据
  const [players, setPlayers] = useState<Player[]>(() =>
    generateMockPlayers(CONFIG.DEFAULT_PLAYER_COUNT)
  );

  // 查询参数
  const [params, setParams] = useState<TopKParams>({
    k: CONFIG.DEFAULT_TOP_K,
    algorithm: 'sort',
  });

  // 自动更新开关
  const [autoUpdate, setAutoUpdate] = useState(false);

  // 上一次的排行榜（用于计算变化）
  const [prevEntries, setPrevEntries] = useState<RankEntry[]>([]);

  // Top-K 查询结果（不在 useMemo 中访问 ref）
  const { rawEntries, time, algorithm } = useMemo(() => {
    const result = getTopK(players, params);
    return { rawEntries: result.entries, time: result.time, algorithm: result.algorithm };
  }, [players, params]);

  // 计算带有排名变化的条目（使用 state 而不是 ref）
  const entries = useMemo(() => {
    return calculateRankChanges(prevEntries, rawEntries);
  }, [prevEntries, rawEntries]);

  // 更新上一次的排行榜（在 effect 中更新）
  useEffect(() => {
    setPrevEntries(rawEntries);
  }, [rawEntries]);

  // 性能指标
  const metrics: PerformanceMetrics = useMemo(
    () => ({
      sortTime: time,
      topKTime: time,
      totalPlayers: players.length,
      displayCount: entries.length,
    }),
    [time, players.length, entries.length]
  );

  // 自动更新积分
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(() => {
      setPlayers((prev) => simulateScoreChange(prev));
    }, CONFIG.UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [autoUpdate]);

  /**
   * 切换算法
   */
  const changeAlgorithm = useCallback((algorithm: TopKParams['algorithm']) => {
    setParams((prev) => ({ ...prev, algorithm }));
  }, []);

  /**
   * 修改 Top-K 数量
   */
  const changeK = useCallback((k: number) => {
    setParams((prev) => ({ ...prev, k }));
  }, []);

  /**
   * 切换自动更新
   */
  const toggleAutoUpdate = useCallback(() => {
    setAutoUpdate((prev) => !prev);
  }, []);

  /**
   * 重新生成数据
   */
  const regenerateData = useCallback(() => {
    setPlayers(generateMockPlayers(CONFIG.DEFAULT_PLAYER_COUNT));
  }, []);

  return {
    // 数据
    entries,
    metrics,
    algorithmName: algorithm,

    // 配置
    params,
    autoUpdate,

    // 操作
    changeAlgorithm,
    changeK,
    toggleAutoUpdate,
    regenerateData,
  };
}
