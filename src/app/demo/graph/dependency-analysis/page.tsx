'use client';

import { GitBranch } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { AnalysisResultCard } from './components/AnalysisResult';
import { ControlPanel } from './components/ControlPanel';
import { DependencyGraph } from './components/DependencyGraph';
import { useDependencyAnalysis } from './hooks/useDependencyAnalysis';

/**
 * 依赖关系分析 Demo 页面
 */
export default function DependencyAnalysisDemo() {
  const {
    modules,
    deps,
    isAnalyzing,
    result,
    newDepFrom,
    newDepTo,
    setNewDepFrom,
    setNewDepTo,
    runAnalysis,
    reset,
    addDep,
    removeDep,
  } = useDependencyAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/graph" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <GitBranch className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">依赖关系分析</h1>
                <p className="text-sm text-slate-400">模块依赖图、拓扑排序、环检测</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="space-y-6">
            <ControlPanel
              modules={modules}
              deps={deps}
              isAnalyzing={isAnalyzing}
              newDepFrom={newDepFrom}
              newDepTo={newDepTo}
              onNewDepFromChange={setNewDepFrom}
              onNewDepToChange={setNewDepTo}
              onAddDep={addDep}
              onRemoveDep={removeDep}
              onRunAnalysis={runAnalysis}
              onReset={reset}
            />

            {/* 分析结果 */}
            {result && <AnalysisResultCard result={result} modules={modules} />}
          </div>

          {/* 右侧：可视化 */}
          <div className="lg:col-span-2">
            <DependencyGraph modules={modules} deps={deps} result={result} />
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-6">
          <AlgorithmInfo />
        </div>
      </main>
    </div>
  );
}
