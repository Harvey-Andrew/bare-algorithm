'use client';

import { Play, RotateCcw, Settings } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { TARGET_TIME } from './constants';
import { useAnswerBinarySearch } from './hooks/useAnswerBinarySearch';

export default function AnswerBinarySearchDemo() {
  const { result, isRunning, runOptimization, reset } = useAnswerBinarySearch();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-search" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">答案二分参数调优</h1>
                <p className="text-sm text-slate-400">二分查找最优 Chunk Size</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 搜索过程 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">二分搜索过程</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {result?.history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg flex justify-between items-center
                    ${h.feasible ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}
                >
                  <div>
                    <span className="text-xs text-slate-400">第 {i + 1} 次</span>
                    <div>
                      Chunk Size: <span className="font-mono font-bold">{h.value}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={h.feasible ? 'text-emerald-400' : 'text-red-400'}>
                      {h.result.toFixed(2)}ms
                    </div>
                    <span className="text-xs">{h.feasible ? '✓ 可行' : '✗ 超时'}</span>
                  </div>
                </div>
              )) || <div className="text-slate-500 text-center py-8">点击开始优化</div>}
            </div>
          </div>

          {/* 结果和控制 */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="font-semibold mb-4">优化目标</h3>
              <p className="text-slate-300 mb-4">
                找到满足处理时间 ≤{' '}
                <span className="text-emerald-400 font-bold">{TARGET_TIME}ms</span> 的最大 Chunk
                Size
              </p>

              {result && (
                <div className="p-4 bg-emerald-500/20 rounded-lg border border-emerald-500">
                  <div className="text-2xl font-bold text-emerald-400 mb-2">
                    最优值: {result.optimalValue}
                  </div>
                  <div className="text-sm text-slate-400">
                    迭代次数: {result.iterations} (O(log n))
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={runOptimization}
                disabled={isRunning}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                  rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-5 h-5" />
                {isRunning ? '优化中...' : '开始优化'}
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600
                  rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">算法说明</h3>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  在单调函数上使用<strong>二分答案</strong>搜索最优参数。
                </p>
                <p className="text-xs text-slate-500">
                  应用场景：确定最大并发数、最佳缓冲区大小等。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
