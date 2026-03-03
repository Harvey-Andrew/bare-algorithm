'use client';

import { ArrowRight, GitMerge, Play } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useFlowOrchestration } from './hooks/useFlowOrchestration';

export default function FlowOrchestrationDemo() {
  const { nodes, paths, selectedPath, setSelectedPath, generate } = useFlowOrchestration();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/backtracking" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <GitMerge className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">流程编排/路径生成</h1>
                <p className="text-sm text-slate-400">回溯算法枚举所有可行执行路径</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 节点图 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">工作流节点</h3>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 bg-slate-700/50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-mono">
                      {node.id}
                    </span>
                    <span>{node.name}</span>
                  </div>
                  {node.dependencies.length > 0 && (
                    <span className="text-xs text-slate-500">
                      依赖: {node.dependencies.join(', ')}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={generate}
              className="w-full mt-4 px-4 py-3 bg-emerald-500 hover:bg-emerald-600
                rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-5 h-5" />
              生成所有执行路径
            </button>
          </div>

          {/* 路径列表 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">可行执行路径</h3>
              <span className="text-sm text-slate-400">共 {paths.length} 条</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paths.length === 0 ? (
                <div className="text-slate-500 text-center py-8">点击生成按钮</div>
              ) : (
                paths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`w-full p-3 rounded-lg flex items-center gap-2 transition-colors cursor-pointer
                      ${selectedPath?.id === path.id ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                  >
                    {path.sequence.map((nodeId, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="px-2 py-1 bg-slate-600 rounded text-sm">{nodeId}</span>
                        {idx < path.sequence.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        )}
                      </span>
                    ))}
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
