'use client';

import { Share2 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { PersonList } from './components/PersonList';
import { RelationGraphSvg } from './components/RelationGraphSvg';
import { ResultCards } from './components/ResultCards';
import { useRelationGraph } from './hooks/useRelationGraph';

/**
 * 关系图可视化 Demo 页面
 */
export default function RelationGraphDemo() {
  const {
    nodes,
    edges,
    selectedNodes,
    shortestPath,
    mutualFriends,
    components,
    handleNodeClick,
    handleFindPath,
    reset,
  } = useRelationGraph();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/graph" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Share2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">关系图可视化</h1>
                <p className="text-sm text-slate-400">连通分量、最短路径、共同好友</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="space-y-6">
            <PersonList
              nodes={nodes}
              components={components}
              selectedNodes={selectedNodes}
              shortestPath={shortestPath}
              onNodeClick={handleNodeClick}
              onFindPath={handleFindPath}
              onReset={reset}
            />

            <ResultCards
              nodes={nodes}
              selectedNodes={selectedNodes}
              shortestPath={shortestPath}
              mutualFriends={mutualFriends}
            />
          </div>

          {/* 右侧：可视化 */}
          <div className="lg:col-span-2">
            <RelationGraphSvg
              nodes={nodes}
              edges={edges}
              components={components}
              selectedNodes={selectedNodes}
              shortestPath={shortestPath}
              mutualFriends={mutualFriends}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        <AlgorithmInfo />
      </main>
    </div>
  );
}
