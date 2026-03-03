'use client';

import { Database } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { CacheVisualizer } from './components/CacheVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { useLRUCache } from './hooks/useLRUCache';

export default function LRUCacheDemo() {
  const {
    entries,
    stats,
    loading,
    queryKey,
    setQueryKey,
    lastResult,
    capacity,
    availableKeys,
    handleGet,
    handleClear,
  } = useLRUCache();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">LRU 缓存策略</h1>
                <p className="text-sm text-slate-400">哈希表 + 双向链表实现的 API 请求缓存</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：缓存可视化 */}
          <div className="lg:col-span-2">
            <CacheVisualizer entries={entries} capacity={capacity} />
          </div>

          {/* 右侧：控制面板和统计 */}
          <div className="space-y-6">
            <ControlPanel
              queryKey={queryKey}
              setQueryKey={setQueryKey}
              availableKeys={availableKeys}
              loading={loading}
              onGet={handleGet}
              onClear={handleClear}
            />
            <StatsPanel stats={stats} lastResult={lastResult} />
            <AlgorithmInfo />
          </div>
        </div>
      </main>
    </div>
  );
}
