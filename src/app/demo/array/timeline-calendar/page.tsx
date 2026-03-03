'use client';

import { Calendar, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { ConflictPanel } from './components/ConflictPanel';
import { RoomSelector } from './components/RoomSelector';
import { StatsPanel } from './components/StatsPanel';
import { TimelineView } from './components/TimelineView';
import { useCalendar } from './hooks/useCalendar';

/**
 * 时间轴/日历/会议室预订 Demo 页面
 * 企业会议室预订场景 - 区间合并、冲突检测、空档查找
 */
export default function TimelineCalendarDemo() {
  const { meetings, rooms, result, metrics, selectedRoom, filterByRoom, regenerateData } =
    useCalendar();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">会议室预订</h1>
                  <p className="text-sm text-slate-400">
                    区间排序 O(n log n) · 冲突检测 · 区间合并
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={regenerateData} className="cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成数据
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧面板 */}
          <div className="space-y-6">
            <RoomSelector rooms={rooms} selectedRoom={selectedRoom} onRoomChange={filterByRoom} />
            <ConflictPanel conflicts={result.conflicts} />
            <StatsPanel result={result} metrics={metrics} />
          </div>

          {/* 右侧时间轴 */}
          <div className="lg:col-span-3 space-y-6">
            <TimelineView
              meetings={meetings}
              mergedIntervals={result.mergedIntervals}
              selectedRoom={selectedRoom}
            />

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📅 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">企业会议室预订系统</strong> -
                  管理员需要检测时间冲突、查找空闲时段、计算使用率
                </p>
                <p>
                  <strong className="text-blue-400">区间合并</strong>:
                  将重叠的会议合并为连续区间，计算总占用时间
                </p>
                <p>
                  <strong className="text-cyan-400">冲突检测</strong>:
                  同一会议室的时间重叠检测，排序后扫描 O(n)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
