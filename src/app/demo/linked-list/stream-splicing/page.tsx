'use client';

import { Layers, Play, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useStreamSplicing } from './hooks/useStreamSplicing';

export default function StreamSplicingDemo() {
  const { chunks, assembled, isStreaming, startStream, reset } = useStreamSplicing();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">流式数据拼接</h1>
                <p className="text-sm text-slate-400">使用链表处理乱序到达的数据块</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 接收到的分片 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">接收的数据分片（乱序）</h3>
            <div className="flex flex-wrap gap-2 min-h-32">
              {chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="px-3 py-2 bg-slate-700 rounded-lg flex items-center gap-2
                    animate-in fade-in duration-300"
                >
                  <span className="text-xs bg-purple-500 text-black px-1.5 py-0.5 rounded">
                    #{chunk.sequence}
                  </span>
                  <span className="font-mono">{chunk.data}</span>
                </div>
              ))}
              {chunks.length === 0 && <div className="text-slate-500">等待数据...</div>}
            </div>
          </div>

          {/* 拼接结果 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">拼接结果（按序号排序）</h3>
            <div className="bg-slate-900 rounded-lg p-4 min-h-32 font-mono text-emerald-400">
              {assembled || <span className="text-slate-500">等待拼接...</span>}
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={startStream}
            disabled={isStreaming}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
              rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-5 h-5" />
            开始模拟
          </button>
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
