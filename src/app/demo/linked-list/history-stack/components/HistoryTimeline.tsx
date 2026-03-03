'use client';

import type { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  currentIndex: number;
}

export function HistoryTimeline({ history, currentIndex }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="font-semibold mb-4">历史记录栈</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {history.map((entry, idx) => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg border transition-all ${
              idx === currentIndex
                ? 'bg-emerald-500/20 border-emerald-500'
                : idx < currentIndex
                  ? 'bg-slate-700/50 border-slate-600 opacity-60'
                  : 'bg-slate-700/30 border-slate-700 opacity-40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">#{idx + 1}</span>
              {idx === currentIndex && (
                <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded">当前</span>
              )}
            </div>
            <div className="text-sm truncate">{entry.content || '(空)'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
