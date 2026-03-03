'use client';

import { useMemo } from 'react';
import { Droplets } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const HEIGHTS = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

function trapWater(heights: number[]): { water: number[]; total: number } {
  const n = heights.length;
  const water = new Array(n).fill(0);
  const stack: number[] = [];
  let total = 0;

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && heights[i] > heights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      if (stack.length === 0) break;
      const left = stack[stack.length - 1];
      const h = Math.min(heights[left], heights[i]) - heights[mid];
      const w = i - left - 1;
      total += h * w;
      for (let j = left + 1; j < i; j++) {
        water[j] = Math.max(water[j], Math.min(heights[left], heights[i]) - heights[j]);
      }
    }
    stack.push(i);
  }

  return { water, total };
}

export default function WaterSimulationDemo() {
  const { water, total } = useMemo(() => trapWater(HEIGHTS), []);
  const maxH = Math.max(...HEIGHTS) + 1;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/monotonic-stack" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Droplets className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">接雨水/凹凸统计</h1>
                <p className="text-sm text-slate-400">单调栈计算凹陷区域</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500 mb-4 text-center">
          <span className="text-lg">总积水量: </span>
          <span className="text-3xl font-bold text-blue-400">{total}</span>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-end gap-1 h-48">
            {HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col-reverse">
                <div
                  className="bg-slate-600 rounded-t"
                  style={{ height: `${(h / maxH) * 100}%` }}
                />
                {water[i] > 0 && (
                  <div
                    className="bg-blue-500/50"
                    style={{ height: `${(water[i] / maxH) * 100}%` }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 text-center text-xs text-slate-400">
                {h}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
