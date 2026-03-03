'use client';

import { useMemo } from 'react';
import { GitMerge } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Source {
  name: string;
  items: number[];
}

const SOURCES: Source[] = [
  { name: 'API A', items: [1, 5, 9, 12] },
  { name: 'API B', items: [2, 6, 10, 15] },
  { name: 'API C', items: [3, 7, 11, 13] },
];

function mergeKSorted(sources: Source[]): number[] {
  const result: number[] = [];
  const pointers = sources.map(() => 0);

  while (true) {
    let minVal = Infinity;
    let minIdx = -1;

    for (let i = 0; i < sources.length; i++) {
      if (pointers[i] < sources[i].items.length && sources[i].items[pointers[i]] < minVal) {
        minVal = sources[i].items[pointers[i]];
        minIdx = i;
      }
    }

    if (minIdx === -1) break;
    result.push(minVal);
    pointers[minIdx]++;
  }

  return result;
}

export default function MultiWayMergeDemo() {
  const merged = useMemo(() => mergeKSorted(SOURCES), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/heap-priority-queue" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <GitMerge className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">多路归并</h1>
                <p className="text-sm text-slate-400">堆维护当前最小值</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {SOURCES.map((s) => (
            <div key={s.name} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3 text-cyan-400">{s.name}</h3>
              <div className="flex flex-wrap gap-2">
                {s.items.map((v, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-700 rounded text-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
          <h3 className="font-semibold mb-4">合并结果 (有序)</h3>
          <div className="flex flex-wrap gap-2">
            {merged.map((v, i) => (
              <span key={i} className="px-3 py-2 bg-emerald-500/20 rounded-lg font-mono">
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="font-semibold mb-2">算法说明</h4>
          <p className="text-sm text-slate-300">
            使用最小堆维护每路当前最小值，每次取出堆顶元素并推入该路下一个元素。
          </p>
          <p className="text-xs text-slate-500 mt-1">时间复杂度: O(N log K)，空间复杂度: O(K)</p>
        </div>
      </main>
    </div>
  );
}
