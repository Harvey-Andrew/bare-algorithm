'use client';

import { useMemo } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const PRICES = [73, 74, 75, 71, 69, 72, 76, 73];

function nextGreater(arr: number[]): number[] {
  const result = new Array(arr.length).fill(-1);
  const stack: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = i;
    }
    stack.push(i);
  }

  return result;
}

export default function NextGreaterVisualDemo() {
  const nextGreaterIdx = useMemo(() => nextGreater(PRICES), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/monotonic-stack" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">图表 Next Greater</h1>
                <p className="text-sm text-slate-400">单调栈查找下一个更大值</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-4">股票价格</h3>
          <div className="flex items-end gap-2 h-40">
            {PRICES.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-emerald-500/50 rounded-t"
                  style={{ height: `${(p - 60) * 4}px` }}
                />
                <span className="text-xs mt-1">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-4">Next Greater Element</h3>
          <div className="space-y-2">
            {PRICES.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-2 bg-slate-700 rounded">
                <span className="font-mono w-12">
                  [{i}] {p}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                {nextGreaterIdx[i] === -1 ? (
                  <span className="text-slate-500">无更大值</span>
                ) : (
                  <span className="text-emerald-400">
                    [{nextGreaterIdx[i]}] {PRICES[nextGreaterIdx[i]]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
