'use client';

import { Grid, Play } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useLayoutExploration } from './hooks/useLayoutExploration';

const COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];

export default function LayoutExplorationDemo() {
  const { widgets, solutions, selectedSolution, setSelectedSolution, explore, gridSize } =
    useLayoutExploration();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/backtracking" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Grid className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">小规模布局探索</h1>
                <p className="text-sm text-slate-400">回溯算法探索仪表盘布局方案</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 组件列表和网格 */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">待布局组件</h3>
              <div className="space-y-2">
                {widgets.map((w, i) => (
                  <div key={w.id} className={`p-3 rounded-lg ${COLORS[i % COLORS.length]}/20`}>
                    <span
                      className={`px-2 py-1 rounded ${COLORS[i % COLORS.length]} text-black text-xs`}
                    >
                      {w.width}x{w.height}
                    </span>
                    <span className="ml-2">{w.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={explore}
              className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600
                rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-5 h-5" />
              探索布局方案
            </button>
          </div>

          {/* 布局预览 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">布局预览</h3>
            <div
              className="grid gap-1 aspect-square"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const x = i % gridSize;
                const y = Math.floor(i / gridSize);
                const placed = selectedSolution?.placements.find(
                  (p) => x >= p.x && x < p.x + p.width && y >= p.y && y < p.y + p.height
                );
                const widgetIdx = placed ? widgets.findIndex((w) => w.id === placed.id) : -1;
                return (
                  <div
                    key={i}
                    className={`rounded flex items-center justify-center text-xs
                      ${placed ? `${COLORS[widgetIdx % COLORS.length]}` : 'bg-slate-700/50'}`}
                  >
                    {placed && x === placed.x && y === placed.y ? placed.name : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 方案列表 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">布局方案</h3>
              <span className="text-sm text-slate-400">{solutions.length} 个</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {solutions.length === 0 ? (
                <div className="text-slate-500 text-center py-4">点击探索按钮</div>
              ) : (
                solutions.map((sol, idx) => (
                  <button
                    key={sol.id}
                    onClick={() => setSelectedSolution(sol)}
                    className={`w-full p-3 rounded-lg text-left transition-colors cursor-pointer
                      ${selectedSolution?.id === sol.id ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                  >
                    方案 #{idx + 1}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
