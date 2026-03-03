'use client';

import { useMemo } from 'react';
import { Ruler } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const DATA = [4, 2, 8, 1, 5, 9, 3, 7];

function findBoundariesOptimized(
  arr: number[]
): Array<{ value: number; left: number; right: number }> {
  const n = arr.length;
  const left = new Array(n).fill(-1);
  const right = new Array(n).fill(-1);
  const stack: number[] = [];

  // 左边界
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] <= arr[i]) stack.pop();
    if (stack.length > 0) left[i] = stack[stack.length - 1];
    stack.push(i);
  }

  stack.length = 0;

  // 右边界
  for (let i = n - 1; i >= 0; i--) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] <= arr[i]) stack.pop();
    if (stack.length > 0) right[i] = stack[stack.length - 1];
    stack.push(i);
  }

  return arr.map((v, i) => ({ value: v, left: left[i], right: right[i] }));
}

export default function BoundaryLookupOptDemo() {
  const optimized = useMemo(() => findBoundariesOptimized(DATA), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/monotonic-stack" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Ruler className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">边界查找优化</h1>
                <p className="text-sm text-slate-400">O(N²) → O(N) 单调栈优化</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-3">数据</h3>
          <div className="flex gap-2">
            {DATA.map((v, i) => (
              <div key={i} className="flex-1 p-3 bg-slate-700 rounded text-center">
                <div className="text-xs text-slate-400">[{i}]</div>
                <div className="font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">边界结果 (Next Greater)</h3>
          <div className="space-y-2">
            {optimized.map((b, i) => (
              <div key={i} className="p-2 bg-slate-700 rounded flex items-center gap-4">
                <span className="font-mono w-16">
                  [{i}] = {b.value}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">
                    左: {b.left === -1 ? '无' : `[${b.left}]=${DATA[b.left]}`}
                  </span>
                  <span className="text-emerald-400">
                    右: {b.right === -1 ? '无' : `[${b.right}]=${DATA[b.right]}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
            <h4 className="font-semibold text-red-400 mb-2">暴力解法</h4>
            <p className="text-sm">O(N²) 双重循环</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
            <h4 className="font-semibold text-emerald-400 mb-2">单调栈优化</h4>
            <p className="text-sm">O(N) 一次遍历</p>
          </div>
        </div>
      </main>
    </div>
  );
}
