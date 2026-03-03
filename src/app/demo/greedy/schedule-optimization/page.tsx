'use client';

import { Calendar, Check, X } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useScheduleOptimization } from './hooks/useScheduleOptimization';

export default function ScheduleOptimizationDemo() {
  const { result } = useScheduleOptimization();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">日程安排/区间选择</h1>
                <p className="text-sm text-slate-400">贪心选择最多不冲突会议</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              已选中 ({result.selected.length})
            </h3>
            <div className="space-y-2">
              {result.selected.map((m) => (
                <div key={m.id} className="p-3 bg-emerald-500/20 rounded-lg flex justify-between">
                  <span>{m.name}</span>
                  <span className="text-slate-400">
                    {m.start}:00 - {m.end}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" />
              被拒绝 ({result.rejected.length})
            </h3>
            <div className="space-y-2">
              {result.rejected.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-red-500/10 rounded-lg flex justify-between opacity-60"
                >
                  <span>{m.name}</span>
                  <span className="text-slate-400">
                    {m.start}:00 - {m.end}:00
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-xl mx-auto bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h4 className="font-semibold mb-2">贪心策略</h4>
          <p className="text-sm text-slate-300">按结束时间排序，每次选择最早结束且不冲突的会议</p>
        </div>
      </main>
    </div>
  );
}
