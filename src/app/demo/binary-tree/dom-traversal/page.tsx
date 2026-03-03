'use client';

import { Play, SkipForward, TreePine } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useDomTraversal } from './hooks/useDomTraversal';
import type { TreeNode } from './types';

function TreeNodeView({
  node,
  visited,
  current,
}: {
  node: TreeNode;
  visited: string[];
  current: string;
}) {
  const isVisited = visited.includes(node.id);
  const isCurrent = node.id === current;
  return (
    <div className="ml-4">
      <div
        className={`px-2 py-1 rounded text-sm inline-block mb-1
        ${isCurrent ? 'bg-emerald-500 text-black' : isVisited ? 'bg-blue-500/30' : 'bg-slate-700'}`}
      >
        &lt;{node.tag}&gt;
      </div>
      {node.children.map((c) => (
        <TreeNodeView key={c.id} node={c} visited={visited} current={current} />
      ))}
    </div>
  );
}

export default function DomTraversalDemo() {
  const { tree, mode, setMode, traversalOrder, currentIndex, traverse, step, reset } =
    useDomTraversal();
  const visited = traversalOrder.slice(0, currentIndex + 1);
  const current = traversalOrder[currentIndex] || '';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TreePine className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DOM/组件树遍历</h1>
                <p className="text-sm text-slate-400">DFS vs BFS 遍历演示</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">DOM 树</h3>
            <TreeNodeView node={tree} visited={visited} current={current} />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">遍历控制</h3>
              <div className="flex gap-2 mb-4">
                {(['dfs', 'bfs'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      reset();
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer
                      ${mode === m ? 'bg-emerald-500 text-black' : 'bg-slate-700'}`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={traverse}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" /> 开始
                </button>
                <button
                  onClick={step}
                  disabled={currentIndex >= traversalOrder.length - 1}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">遍历顺序</h3>
              <div className="flex flex-wrap gap-2">
                {traversalOrder.map((id, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs
                    ${i === currentIndex ? 'bg-emerald-500 text-black' : i < currentIndex ? 'bg-blue-500/30' : 'bg-slate-700'}`}
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
