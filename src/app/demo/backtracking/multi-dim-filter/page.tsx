'use client';

import { Layers, Play, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { DimensionPanel } from './components/DimensionPanel';
import { ResultGrid } from './components/ResultGrid';
import { useMultiDimFilter } from './hooks/useMultiDimFilter';

export default function MultiDimFilterDemo() {
  const { dimensions, result, expectedCount, generate, removeOption, reset } = useMultiDimFilter();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/backtracking" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">多维筛选与组合</h1>
                <p className="text-sm text-slate-400">回溯算法生成 SKU 笛卡尔积</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <DimensionPanel dimensions={dimensions} onRemoveOption={removeOption} />

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">预计组合数量</div>
              <div className="text-3xl font-bold text-emerald-400">{expectedCount}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generate}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600
                  rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-5 h-5" />
                生成组合
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600
                  rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ResultGrid result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
