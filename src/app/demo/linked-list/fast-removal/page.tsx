'use client';

import { ArrowRight, RotateCcw, Trash2, Zap } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useFastRemoval } from './hooks/useFastRemoval';

export default function FastRemovalDemo() {
  const { orderedItems, remove, reset, lastOperation } = useFastRemoval();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Zap className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">O(1) 节点删除</h1>
                <p className="text-sm text-slate-400">双向链表实现常数时间删除</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 链表可视化 */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4">双向链表</h3>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {orderedItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="relative group">
                  <div className="px-4 py-3 bg-slate-700 rounded-lg flex items-center gap-2">
                    <span>{item.name}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-500/20
                        hover:bg-red-500/40 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                {idx < orderedItems.length - 1 && <ArrowRight className="w-4 h-4 text-slate-500" />}
              </div>
            ))}
            {orderedItems.length === 0 && <div className="text-slate-500">链表为空</div>}
          </div>
        </div>

        {/* 操作信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">操作日志</h3>
            {lastOperation ? (
              <div className="bg-emerald-500/20 p-3 rounded-lg">
                <div className="text-sm">
                  删除节点: <span className="font-bold">{lastOperation.name}</span>
                </div>
                <div className="text-xs text-slate-400">
                  耗时: {lastOperation.time.toFixed(3)}ms (O(1))
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">点击节点的删除按钮</div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">算法说明</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <p>双向链表删除节点只需 O(1)：</p>
              <p className="font-mono text-xs text-slate-400">node.prev.next = node.next</p>
              <p className="font-mono text-xs text-slate-400">node.next.prev = node.prev</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={reset}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600
              rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            重置
          </button>
        </div>
      </main>
    </div>
  );
}
