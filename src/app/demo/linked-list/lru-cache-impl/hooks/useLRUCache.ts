'use client';

import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_CAPACITY, DEFAULT_ENTRIES, MOCK_API_DATA } from '../constants';
import { LRUCache, simulateApiRequest } from '../services/lru.api';
import type { CacheEntry, CacheStats, OperationLog } from '../types';

export function useLRUCache() {
  const [cache] = useState(() => {
    const lru = new LRUCache(DEFAULT_CAPACITY);
    DEFAULT_ENTRIES.forEach((e) => lru.put(e.key, e.value));
    return lru;
  });

  const [entries, setEntries] = useState<CacheEntry[]>(cache.getAll());
  const [stats, setStats] = useState<CacheStats>(cache.getStats());
  const [logs, setLogs] = useState<OperationLog[]>(cache.getLogs());
  const [loading, setLoading] = useState(false);
  const [queryKey, setQueryKey] = useState('');
  const [lastResult, setLastResult] = useState<{
    key: string;
    hit: boolean;
    value?: string;
  } | null>(null);

  const refresh = useCallback(() => {
    setEntries(cache.getAll());
    setStats(cache.getStats());
    setLogs(cache.getLogs());
  }, [cache]);

  const handleGet = useCallback(
    async (key: string) => {
      setLoading(true);
      const cached = cache.get(key);

      if (cached) {
        setLastResult({ key, hit: true, value: cached.value });
        refresh();
        setLoading(false);
        return;
      }

      // 缓存未命中，模拟 API 请求
      const apiValue = await simulateApiRequest(key, MOCK_API_DATA);
      if (apiValue) {
        cache.put(key, apiValue);
        setLastResult({ key, hit: false, value: apiValue });
      } else {
        setLastResult({ key, hit: false });
      }
      refresh();
      setLoading(false);
    },
    [cache, refresh]
  );

  const handlePut = useCallback(
    (key: string, value: string) => {
      cache.put(key, value);
      setLastResult(null);
      refresh();
    },
    [cache, refresh]
  );

  const handleClear = useCallback(() => {
    cache.clear();
    setLastResult(null);
    refresh();
  }, [cache, refresh]);

  const availableKeys = useMemo(() => Object.keys(MOCK_API_DATA), []);

  return {
    entries,
    stats,
    logs,
    loading,
    queryKey,
    setQueryKey,
    lastResult,
    capacity: cache.getCapacity(),
    availableKeys,
    handleGet,
    handlePut,
    handleClear,
  };
}
