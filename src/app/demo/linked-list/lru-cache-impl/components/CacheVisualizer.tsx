'use client';

import { Database } from 'lucide-react';

import type { CacheEntry } from '../types';

interface Props {
  entries: CacheEntry[];
  capacity: number;
}

export function CacheVisualizer({ entries, capacity }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold">缓存状态</h3>
        <span className="text-sm text-slate-400">
          ({entries.length}/{capacity})
        </span>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-slate-500 text-center py-4">缓存为空</div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={entry.key}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all
                ${idx === 0 ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-700/50 border-slate-600'}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${idx === 0 ? 'bg-emerald-500 text-black' : 'bg-slate-600'}`}
                >
                  {idx === 0 ? 'MRU' : idx === entries.length - 1 ? 'LRU' : idx + 1}
                </span>
                <span className="font-mono text-sm">{entry.key}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-300">{entry.value}</span>
              </div>
            </div>
          ))
        )}

        {/* 空槽位 */}
        {Array.from({ length: Math.max(0, capacity - entries.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="p-3 rounded-lg border border-dashed border-slate-700 text-slate-600 text-center"
          >
            空槽位
          </div>
        ))}
      </div>
    </div>
  );
}
