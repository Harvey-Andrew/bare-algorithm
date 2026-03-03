'use client';

import { useCallback, useState } from 'react';
import { Cpu, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const cache = new Map<number, { value: bigint; cached: boolean }>();

function fibMemo(n: number): { value: bigint; cached: boolean } {
  if (cache.has(n)) return { value: cache.get(n)!.value, cached: true };
  if (n <= 1) {
    cache.set(n, { value: BigInt(n), cached: false });
    return { value: BigInt(n), cached: false };
  }
  const result = fibMemo(n - 1).value + fibMemo(n - 2).value;
  cache.set(n, { value: result, cached: false });
  return { value: result, cached: false };
}

export default function MemoizedSearchDemo() {
  const [n, setN] = useState(20);
  const [results, setResults] = useState<Array<{ n: number; value: string; cached: boolean }>>([]);

  const compute = useCallback(() => {
    cache.clear();
    const newResults: typeof results = [];
    for (let i = 0; i <= n; i++) {
      const { value, cached } = fibMemo(i);
      newResults.push({ n: i, value: value.toString(), cached });
    }
    setResults(newResults);
  }, [n]);

  const reset = () => {
    cache.clear();
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/dynamic-programming" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">记忆化搜索</h1>
                <p className="text-sm text-slate-400">缓存中间结果</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
            <label className="text-sm text-slate-400">计算 Fibonacci(n), n = {n}</label>
            <input
              type="range"
              min={5}
              max={40}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={compute}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer"
              >
                计算
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {results.map((r) => (
                <div
                  key={r.n}
                  className={`p-2 rounded text-center text-xs
                  ${r.cached ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className="text-slate-400">F({r.n})</div>
                  <div className="truncate">
                    {r.value.slice(0, 8)}
                    {r.value.length > 8 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
