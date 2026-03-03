'use client';

import { useCallback, useMemo, useState } from 'react';
import { Activity, Plus } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

function findMedian(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export default function StreamingMedianDemo() {
  const [values, setValues] = useState<number[]>([5, 2, 8, 1, 9]);

  const addRandom = useCallback(() => {
    setValues((prev) => [...prev, Math.floor(Math.random() * 20) + 1]);
  }, []);

  const median = useMemo(() => findMedian(values), [values]);
  const sorted = useMemo(() => [...values].sort((a, b) => a - b), [values]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/heap-priority-queue" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">流式数据中位数</h1>
                <p className="text-sm text-slate-400">双堆实时计算</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/30 mb-4 text-center">
          <div className="text-sm text-slate-400 mb-2">当前中位数</div>
          <div className="text-5xl font-bold text-purple-400">{median.toFixed(1)}</div>
        </div>

        <button
          onClick={addRandom}
          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-5 h-5" /> 添加随机数据
        </button>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-3">数据流 (按到达顺序)</h3>
          <div className="flex flex-wrap gap-2">
            {values.map((v, i) => (
              <span key={i} className="px-3 py-1 bg-slate-700 rounded font-mono">
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">排序后视图</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {sorted.map((v, i) => {
              const isMid =
                i === Math.floor(sorted.length / 2) ||
                (sorted.length % 2 === 0 && i === Math.floor(sorted.length / 2) - 1);
              return (
                <span
                  key={i}
                  className={`px-3 py-1 rounded font-mono ${isMid ? 'bg-purple-500 text-black' : 'bg-slate-700'}`}
                >
                  {v}
                </span>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
