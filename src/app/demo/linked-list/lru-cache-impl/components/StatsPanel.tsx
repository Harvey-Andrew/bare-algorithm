'use client';

import { BarChart2, CheckCircle, XCircle } from 'lucide-react';

import type { CacheStats } from '../types';

interface Props {
  stats: CacheStats;
  lastResult: { key: string; hit: boolean; value?: string } | null;
}

export function StatsPanel({ stats, lastResult }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold">统计信息</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.hits}</div>
          <div className="text-xs text-slate-400">命中</div>
        </div>
        <div className="bg-red-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.misses}</div>
          <div className="text-xs text-slate-400">未命中</div>
        </div>
        <div className="bg-amber-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.evictions}</div>
          <div className="text-xs text-slate-400">淘汰次数</div>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {(stats.hitRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">命中率</div>
        </div>
      </div>

      {lastResult && (
        <div
          className={`p-3 rounded-lg flex items-center gap-3 ${lastResult.hit ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}
        >
          {lastResult.hit ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <div className="text-sm font-medium">{lastResult.hit ? '缓存命中!' : '缓存未命中'}</div>
            <div className="text-xs text-slate-400">
              Key: {lastResult.key}
              {lastResult.value && ` → ${lastResult.value}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
