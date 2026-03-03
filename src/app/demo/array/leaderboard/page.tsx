'use client';

import { Trophy } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { ControlPanel } from './components/ControlPanel';
import { RankingList } from './components/RankingList';
import { useLeaderboard } from './hooks/useLeaderboard';

/**
 * 排行榜/积分榜 Demo 页面
 * 游戏排行榜场景 - Top-K 查询、快速选择、堆排序
 */
export default function LeaderboardDemo() {
  const {
    entries,
    metrics,
    algorithmName,
    params,
    autoUpdate,
    changeAlgorithm,
    changeK,
    toggleAutoUpdate,
    regenerateData,
  } = useLeaderboard();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">游戏排行榜</h1>
                  <p className="text-sm text-slate-400">
                    Top-K 查询 · 快速选择 O(n) · 最小堆 O(n log k)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧控制面板 */}
          <div>
            <ControlPanel
              params={params}
              metrics={metrics}
              algorithmName={algorithmName}
              autoUpdate={autoUpdate}
              onAlgorithmChange={changeAlgorithm}
              onKChange={changeK}
              onToggleAutoUpdate={toggleAutoUpdate}
              onRegenerate={regenerateData}
            />
          </div>

          {/* 右侧排行榜 */}
          <div className="lg:col-span-3 space-y-6">
            <RankingList entries={entries} />

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">🏆 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">游戏排行榜</strong> - 从 10,000+ 玩家中实时查询
                  Top-K 排名
                </p>
                <p>
                  <strong className="text-yellow-400">快速选择</strong>: 平均 O(n) 找到第 K 大元素
                </p>
                <p>
                  <strong className="text-cyan-400">最小堆</strong>: O(n log k) 维护一个大小为 K
                  的堆
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
