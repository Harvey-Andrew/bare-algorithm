'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_CONFIG, generateMockKeywords, PERFORMANCE_CONFIG } from '../constants';
import { buildPrefixIndex, search } from '../services/search.api';
import type { PerformanceMetrics, SearchConfig, SearchItem, Suggestion } from '../types';

/**
 * 自动补全状态管理 Hook
 */
export function useAutocomplete() {
  // 原始数据
  const [keywords] = useState<SearchItem[]>(() =>
    generateMockKeywords(PERFORMANCE_CONFIG.DEFAULT_KEYWORD_COUNT)
  );

  // 搜索配置
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_CONFIG);

  // 搜索关键词
  const [query, setQuery] = useState('');

  // 搜索结果
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  // 构建前缀索引
  const { index, buildTime } = useMemo(() => {
    return buildPrefixIndex(keywords);
  }, [keywords]);

  // 防抖定时器
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 执行搜索
  const executeSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        setTotalMatches(0);
        setSearchTime(0);
        return;
      }

      const result = search(index, keywords, q, config);
      setSuggestions(result.suggestions);
      setTotalMatches(result.totalMatches);
      setSearchTime(result.searchTime);
    },
    [index, keywords, config]
  );

  // 防抖搜索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(query);
    }, PERFORMANCE_CONFIG.DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, executeSearch]);

  // 性能指标
  const metrics: PerformanceMetrics = useMemo(
    () => ({
      indexBuildTime: buildTime,
      searchTime,
      totalKeywords: keywords.length,
      matchCount: totalMatches,
    }),
    [buildTime, searchTime, keywords.length, totalMatches]
  );

  /**
   * 更新搜索关键词
   */
  const updateQuery = useCallback((q: string) => {
    setQuery(q);
  }, []);

  /**
   * 更新配置
   */
  const updateConfig = useCallback((newConfig: Partial<SearchConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * 清空搜索
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setTotalMatches(0);
    setSearchTime(0);
  }, []);

  return {
    // 数据
    suggestions,
    totalMatches,
    metrics,

    // 状态
    query,
    config,

    // 操作
    updateQuery,
    updateConfig,
    clearSearch,
  };
}
