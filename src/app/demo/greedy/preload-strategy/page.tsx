'use client';

import { Download, Play, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { ResourceList } from './components/ResourceList';
import { usePreloadStrategy } from './hooks/usePreloadStrategy';

export default function PreloadStrategyDemo() {
  const { sortedResources, loadedIds, isLoading, startLoad, reset } = usePreloadStrategy();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Download className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">首屏/预加载策略</h1>
                <p className="text-sm text-slate-400">贪心算法优先加载高收益资源</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
            <h3 className="font-semibold mb-4">贪心加载顺序</h3>
            <ResourceList resources={sortedResources} loadedIds={loadedIds} />
          </div>

          <div className="flex gap-2">
            <button
              onClick={startLoad}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-5 h-5" />
              {isLoading ? '加载中...' : '开始加载'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h4 className="font-semibold mb-2">贪心策略</h4>
            <p className="text-sm text-slate-300">1. 视口内资源优先</p>
            <p className="text-sm text-slate-300">2. 同等条件下，优先级高者先加载</p>
          </div>
        </div>
      </main>
    </div>
  );
}
