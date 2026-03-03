'use client';

import { useCallback, useMemo, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Item {
  id: string;
  name: string;
  score: number;
}

function getTopK(items: Item[], k: number): Item[] {
  return [...items].sort((a, b) => b.score - a.score).slice(0, k);
}

export default function TopKStatisticsDemo() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: '产品A', score: 85 },
    { id: '2', name: '产品B', score: 92 },
    { id: '3', name: '产品C', score: 78 },
    { id: '4', name: '产品D', score: 95 },
    { id: '5', name: '产品E', score: 88 },
  ]);
  const [k, setK] = useState(3);

  const topK = useMemo(() => getTopK(items, k), [items, k]);

  const addRandom = useCallback(() => {
    const id = String(items.length + 1);
    const score = Math.floor(Math.random() * 50) + 50;
    setItems((prev) => [
      ...prev,
      { id, name: `产品${String.fromCharCode(65 + items.length)}`, score },
    ]);
  }, [items.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/heap-priority-queue" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TopK 统计</h1>
                <p className="text-sm text-slate-400">最小堆维护排行榜</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <div className="flex items-center justify-between mb-4">
            <label>显示 Top {k}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <button
            onClick={addRandom}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> 添加随机产品
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
          <h3 className="font-semibold mb-4">🏆 排行榜 Top {k}</h3>
          <div className="space-y-2">
            {topK.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-amber-500/20 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-amber-400">#{idx + 1}</span>
                  <span>{item.name}</span>
                </div>
                <span className="font-bold">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-2">全部数据 ({items.length})</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item.id}
                className={`px-2 py-1 rounded text-xs ${topK.includes(item) ? 'bg-amber-500/20' : 'bg-slate-700'}`}
              >
                {item.name}: {item.score}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
