'use client';

import { useMemo, useState } from 'react';
import { Check, Puzzle } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Feature {
  id: number;
  name: string;
  conflicts: number[];
}

const FEATURES: Feature[] = [
  { id: 0, name: '模块A', conflicts: [1] },
  { id: 1, name: '模块B', conflicts: [0, 2] },
  { id: 2, name: '模块C', conflicts: [1] },
  { id: 3, name: '模块D', conflicts: [4] },
  { id: 4, name: '模块E', conflicts: [3] },
];

function findOptimalCombination(features: Feature[]): { mask: number; count: number } {
  const n = features.length;
  let best = { mask: 0, count: 0 };

  for (let mask = 0; mask < 1 << n; mask++) {
    let valid = true;
    let count = 0;

    for (let i = 0; i < n && valid; i++) {
      if ((mask & (1 << i)) !== 0) {
        count++;
        for (const c of features[i].conflicts) {
          if ((mask & (1 << c)) !== 0) {
            valid = false;
            break;
          }
        }
      }
    }

    if (valid && count > best.count) {
      best = { mask, count };
    }
  }
  return best;
}

export default function StateCompressionOptimizationDemo() {
  const [selectedMask, setSelectedMask] = useState(0);
  const optimal = useMemo(() => findOptimalCombination(FEATURES), []);

  const toggle = (id: number) => {
    setSelectedMask((prev) => prev ^ (1 << id));
  };

  const isValid = useMemo(() => {
    for (let i = 0; i < FEATURES.length; i++) {
      if ((selectedMask & (1 << i)) !== 0) {
        for (const c of FEATURES[i].conflicts) {
          if ((selectedMask & (1 << c)) !== 0) return false;
        }
      }
    }
    return true;
  }, [selectedMask]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/dynamic-programming" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Puzzle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">最优组合选取</h1>
                <p className="text-sm text-slate-400">状压 DP 求解</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4">选择模块 (有互斥约束)</h3>
          <div className="grid grid-cols-5 gap-2">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                onClick={() => toggle(f.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex flex-col items-center
                  ${(selectedMask & (1 << f.id)) !== 0 ? 'bg-emerald-500 text-black' : 'bg-slate-700'}`}
              >
                {f.name}
                <span className="text-xs opacity-70">
                  冲突: {f.conflicts.map((c) => FEATURES[c].name).join(',') || '无'}
                </span>
              </button>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-lg ${isValid ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {isValid ? '✓ 当前组合有效' : '✗ 存在冲突'}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">最优解 (状压 DP)</h3>
          <div className="flex gap-2 flex-wrap">
            {FEATURES.filter((_, i) => (optimal.mask & (1 << i)) !== 0).map((f) => (
              <span
                key={f.id}
                className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> {f.name}
              </span>
            ))}
          </div>
          <div className="text-sm text-slate-400 mt-3">
            最多可选 {optimal.count} 个互不冲突的模块
          </div>
        </div>
      </main>
    </div>
  );
}
