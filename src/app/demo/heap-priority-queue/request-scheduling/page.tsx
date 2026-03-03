'use client';

import { useCallback, useState } from 'react';
import { ListOrdered, Play } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Task {
  id: string;
  name: string;
  priority: number;
}

const TASKS: Task[] = [
  { id: 't1', name: 'UI 渲染', priority: 10 },
  { id: 't2', name: '数据同步', priority: 5 },
  { id: 't3', name: '日志上报', priority: 2 },
  { id: 't4', name: '埋点发送', priority: 1 },
  { id: 't5', name: '用户操作', priority: 9 },
];

export default function RequestSchedulingDemo() {
  const [queue, setQueue] = useState<Task[]>([...TASKS].sort((a, b) => b.priority - a.priority));
  const [processing, setProcessing] = useState<Task | null>(null);
  const [completed, setCompleted] = useState<Task[]>([]);

  const processNext = useCallback(async () => {
    if (queue.length === 0) return;
    const next = queue[0];
    setProcessing(next);
    setQueue((q) => q.slice(1));
    await new Promise((r) => setTimeout(r, 800));
    setCompleted((c) => [...c, next]);
    setProcessing(null);
  }, [queue]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/heap-priority-queue" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ListOrdered className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">请求/任务调度</h1>
                <p className="text-sm text-slate-400">优先队列管理任务</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">等待队列 (最大堆)</h3>
            <div className="space-y-2">
              {queue.map((t) => (
                <div key={t.id} className="p-2 bg-slate-700 rounded flex justify-between">
                  <span>{t.name}</span>
                  <span className="text-blue-400">P{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
            <h3 className="font-semibold mb-3">处理中</h3>
            {processing ? (
              <div className="p-4 bg-amber-500/20 rounded-lg text-center animate-pulse">
                <div className="font-bold">{processing.name}</div>
                <div className="text-sm text-slate-400">P{processing.priority}</div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500">空闲</div>
            )}
            <button
              onClick={processNext}
              disabled={queue.length === 0 || !!processing}
              className="w-full mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> 处理下一个
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
            <h3 className="font-semibold mb-3">已完成</h3>
            <div className="space-y-2">
              {completed.map((t) => (
                <div key={t.id} className="p-2 bg-emerald-500/20 rounded">
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
