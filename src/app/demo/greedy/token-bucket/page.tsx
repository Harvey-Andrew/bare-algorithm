'use client';

import { useCallback, useState } from 'react';
import { Coins, Send } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Request {
  id: string;
  name: string;
  priority: number;
}

const REQUESTS: Request[] = [
  { id: 'r1', name: 'API 请求 A', priority: 3 },
  { id: 'r2', name: 'API 请求 B', priority: 1 },
  { id: 'r3', name: 'API 请求 C', priority: 5 },
  { id: 'r4', name: 'API 请求 D', priority: 2 },
  { id: 'r5', name: 'API 请求 E', priority: 4 },
];

export default function TokenBucketDemo() {
  const [tokens, setTokens] = useState(3);
  const [processed, setProcessed] = useState<string[]>([]);
  const [pending, setPending] = useState<Request[]>(
    [...REQUESTS].sort((a, b) => b.priority - a.priority)
  );

  const processNext = useCallback(() => {
    if (tokens <= 0 || pending.length === 0) return;
    const next = pending[0];
    setTokens((t) => t - 1);
    setProcessed((p) => [...p, next.id]);
    setPending((p) => p.slice(1));
    setTimeout(() => setTokens((t) => Math.min(t + 1, 3)), 1000);
  }, [tokens, pending]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">并发令牌/带宽分配</h1>
                <p className="text-sm text-slate-400">令牌桶限流 + 优先级贪心</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span>可用令牌</span>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${i < tokens ? 'bg-amber-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={processNext}
            disabled={tokens <= 0 || pending.length === 0}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-5 h-5" /> 处理下一个请求
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">等待队列 (按优先级)</h3>
            <div className="space-y-2">
              {pending.map((r) => (
                <div key={r.id} className="p-2 bg-slate-700 rounded flex justify-between">
                  <span>{r.name}</span>
                  <span className="text-amber-400">P{r.priority}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
            <h3 className="font-semibold mb-3">已处理</h3>
            <div className="space-y-2">
              {processed.map((id) => (
                <div key={id} className="p-2 bg-emerald-500/20 rounded">
                  {REQUESTS.find((r) => r.id === id)?.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
