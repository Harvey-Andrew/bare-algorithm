'use client';

import { useCallback, useState } from 'react';
import { Zap } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const cache = new Map<string, { result: number; cached: boolean }>();

function fibonacci(n: number): number {
  if (n <= 1) return n;
  const key = String(n);
  if (cache.has(key)) return cache.get(key)!.result;
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  cache.set(key, { result, cached: false });
  return result;
}

export default function CachingMemoizationDemo() {
  const [input, setInput] = useState(10);
  const [results, setResults] = useState<
    Array<{ n: number; result: number; time: number; cached: boolean }>
  >([]);

  const compute = useCallback(() => {
    cache.clear();
    const start = performance.now();
    const result = fibonacci(input);
    const time = performance.now() - start;
    setResults((prev) => [...prev, { n: input, result, time, cached: false }]);
  }, [input]);

  const computeCached = useCallback(() => {
    const start = performance.now();
    const result = fibonacci(input);
    const time = performance.now() - start;
    setResults((prev) => [...prev, { n: input, result, time, cached: true }]);
  }, [input]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">缓存与记忆化</h1>
                <p className="text-sm text-slate-400">Map 缓存计算结果</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <label className="text-sm text-slate-400">Fibonacci(n), n = {input}</label>
          <input
            type="range"
            min={5}
            max={30}
            value={input}
            onChange={(e) => setInput(Number(e.target.value))}
            className="w-full mt-2"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={compute}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
            >
              清空缓存后计算
            </button>
            <button
              onClick={computeCached}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer"
            >
              使用缓存计算
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">计算记录</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-2 rounded flex justify-between ${r.cached ? 'bg-emerald-500/20' : 'bg-slate-700'}`}
              >
                <span>
                  F({r.n}) = {r.result}
                </span>
                <span className="text-xs">
                  {r.time.toFixed(2)}ms {r.cached && '(cached)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
