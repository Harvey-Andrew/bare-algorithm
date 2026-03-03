'use client';

import { GitMerge } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { AnalysisResult } from './components/AnalysisResult';
import { TaskList } from './components/TaskList';
import { WorkflowGraph } from './components/WorkflowGraph';
import { useWorkflow } from './hooks/useWorkflow';

/**
 * 工作流编排 Demo 页面
 */
export default function WorkflowDemo() {
  const {
    tasks,
    edges,
    result,
    selectedTask,
    affectedNodes,
    isAnalyzing,
    runAnalysis,
    reset,
    toggleTask,
  } = useWorkflow();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/graph" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <GitMerge className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">工作流编排</h1>
                <p className="text-sm text-slate-400">关键路径分析、任务调度、影响分析</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="space-y-6">
            <TaskList
              tasks={tasks}
              result={result}
              selectedTask={selectedTask}
              isAnalyzing={isAnalyzing}
              onTaskClick={toggleTask}
              onRunAnalysis={runAnalysis}
              onReset={reset}
            />

            <AnalysisResult
              tasks={tasks}
              result={result}
              selectedTask={selectedTask}
              affectedNodes={affectedNodes}
            />
          </div>

          {/* 右侧：可视化 */}
          <div className="lg:col-span-2">
            <WorkflowGraph
              tasks={tasks}
              edges={edges}
              result={result}
              selectedTask={selectedTask}
              affectedNodes={affectedNodes}
              onTaskClick={toggleTask}
            />
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
