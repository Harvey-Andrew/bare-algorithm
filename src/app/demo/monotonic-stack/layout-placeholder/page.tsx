'use client';

import { useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const HISTOGRAM = [2, 1, 5, 6, 2, 3];

function largestRectangleArea(heights: number[]): {
  area: number;
  left: number;
  right: number;
  height: number;
} {
  const n = heights.length;
  const leftBound = new Array(n).fill(0);
  const rightBound = new Array(n).fill(n);
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && heights[stack[stack.length - 1]] >= heights[i]) {
      rightBound[stack.pop()!] = i;
    }
    leftBound[i] = stack.length > 0 ? stack[stack.length - 1] + 1 : 0;
    stack.push(i);
  }

  let maxArea = 0;
  let result = { area: 0, left: 0, right: 0, height: 0 };

  for (let i = 0; i < n; i++) {
    const area = heights[i] * (rightBound[i] - leftBound[i]);
    if (area > maxArea) {
      maxArea = area;
      result = { area, left: leftBound[i], right: rightBound[i] - 1, height: heights[i] };
    }
  }

  return result;
}

export default function LayoutPlaceholderDemo() {
  const result = useMemo(() => largestRectangleArea(HISTOGRAM), []);
  const maxH = Math.max(...HISTOGRAM);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/monotonic-stack" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <LayoutGrid className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">直方图最大矩形</h1>
                <p className="text-sm text-slate-400">单调栈计算最大面积</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-4">直方图</h3>
          <div className="flex items-end gap-2 h-48 relative">
            {HISTOGRAM.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                <div
                  className={`w-full rounded-t transition-colors ${
                    i >= result.left && i <= result.right ? 'bg-purple-500' : 'bg-slate-600'
                  }`}
                  style={{ height: `${(h / maxH) * 100}%` }}
                />
                <span className="text-xs mt-1">{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500">
          <h3 className="font-semibold mb-2">最大矩形</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              面积: <span className="text-purple-400 font-bold">{result.area}</span>
            </div>
            <div>
              高度: <span className="text-purple-400">{result.height}</span>
            </div>
            <div>
              左边界: <span className="text-purple-400">{result.left}</span>
            </div>
            <div>
              右边界: <span className="text-purple-400">{result.right}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
