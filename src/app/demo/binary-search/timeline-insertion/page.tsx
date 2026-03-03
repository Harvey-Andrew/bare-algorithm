'use client';

import { Calendar, Plus, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useTimelineInsertion } from './hooks/useTimelineInsertion';

export default function TimelineInsertionDemo() {
  const { events, newEvent, setNewEvent, lastResult, tryInsert, reset } = useTimelineInsertion();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-search" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">时间轴/区间插入</h1>
                <p className="text-sm text-slate-400">二分查找定位插入位置检测冲突</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 时间轴 */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">日程时间轴</h3>
            <div className="relative h-16 bg-slate-900 rounded-lg mb-4">
              {/* 时间刻度 */}
              {Array.from({ length: 13 }, (_, i) => i + 8).map((h) => (
                <div
                  key={h}
                  className="absolute top-0 h-full border-l border-slate-700"
                  style={{ left: `${((h - 8) / 12) * 100}%` }}
                >
                  <span className="absolute -top-5 -translate-x-1/2 text-xs text-slate-500">
                    {h}:00
                  </span>
                </div>
              ))}
              {/* 事件块 */}
              {events.map((e) => (
                <div
                  key={e.id}
                  className="absolute top-2 h-12 bg-amber-500/30 border border-amber-500 rounded-lg flex items-center justify-center text-xs"
                  style={{
                    left: `${((e.start - 8) / 12) * 100}%`,
                    width: `${((e.end - e.start) / 12) * 100}%`,
                  }}
                >
                  {e.title}
                </div>
              ))}
            </div>

            {/* 事件列表 */}
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="p-2 bg-slate-700/50 rounded flex justify-between">
                  <span>{e.title}</span>
                  <span className="text-slate-400">
                    {e.start}:00 - {e.end}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 插入面板 */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">添加新事件</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="事件名称"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">开始时间</label>
                    <input
                      type="number"
                      min={8}
                      max={19}
                      value={newEvent.start}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, start: parseInt(e.target.value) }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">结束时间</label>
                    <input
                      type="number"
                      min={9}
                      max={20}
                      value={newEvent.end}
                      onChange={(e) =>
                        setNewEvent((p) => ({ ...p, end: parseInt(e.target.value) }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-slate-600"
                    />
                  </div>
                </div>
                <button
                  onClick={tryInsert}
                  className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg
                    flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  插入事件
                </button>
              </div>
            </div>

            {lastResult && (
              <div
                className={`p-4 rounded-xl border ${lastResult.conflict ? 'bg-red-500/20 border-red-500' : 'bg-emerald-500/20 border-emerald-500'}`}
              >
                <div className="font-semibold mb-2">
                  {lastResult.conflict ? '❌ 时间冲突' : '✅ 插入成功'}
                </div>
                <div className="text-sm text-slate-300">
                  二分查找定位: 索引 {lastResult.index}
                  {lastResult.conflict && lastResult.conflictWith && (
                    <span className="block text-red-300">
                      与【{lastResult.conflictWith.title}】冲突
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg
                flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
