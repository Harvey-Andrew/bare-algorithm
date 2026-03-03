'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const EVENTS = [
  'click_button',
  'page_view',
  'click_button',
  'form_submit',
  'page_view',
  'click_button',
  'scroll',
  'page_view',
  'click_button',
  'form_submit',
  'scroll',
  'scroll',
  'page_view',
  'click_button',
  'page_view',
];

function countEvents(events: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event, (counts.get(event) || 0) + 1);
  }
  return counts;
}

export default function CountingAggregationDemo() {
  const counts = useMemo(() => countEvents(EVENTS), []);
  const sorted = useMemo(() => [...counts.entries()].sort((a, b) => b[1] - a[1]), [counts]);
  const max = sorted[0]?.[1] || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">计数与聚合</h1>
                <p className="text-sm text-slate-400">哈希表统计频次</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-3">埋点事件</h3>
          <div className="flex flex-wrap gap-1">
            {EVENTS.map((e, i) => (
              <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-4">统计结果</h3>
          <div className="space-y-3">
            {sorted.map(([event, count]) => (
              <div key={event} className="flex items-center gap-3">
                <span className="w-28 font-mono text-sm">{event}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
