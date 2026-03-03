'use client';

import { Calendar, Clock, Layers } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, formatTime } from '../services/interval.api';
import type { AnalysisResult, PerformanceMetrics } from '../types';

interface StatsPanelProps {
  result: AnalysisResult;
  metrics: PerformanceMetrics;
}

/**
 * 统计面板组件
 */
export function StatsPanel({ result, metrics }: StatsPanelProps) {
  const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          统计概览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 会议数量 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-4 h-4" />
            <span className="text-sm">会议总数</span>
          </div>
          <span className="text-white font-mono">{metrics.totalMeetings}</span>
        </div>

        {/* 使用率 */}
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400">会议室使用率</span>
            <span className="text-cyan-400 font-mono font-bold">
              {formatPercent(result.utilizationRate)}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: formatPercent(result.utilizationRate) }}
            />
          </div>
        </div>

        {/* 空闲时段 */}
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">空闲时段</span>
          </div>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {result.freeSlots.length > 0 ? (
              result.freeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded text-sm"
                >
                  <span className="text-green-400">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                  <span className="text-slate-400">{formatDuration(slot.duration)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">今日无空闲时段</p>
            )}
          </div>
        </div>

        {/* 性能指标 */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          <p>• 排序: {metrics.sortTime.toFixed(3)}ms</p>
          <p>• 冲突检测: {metrics.conflictDetectTime.toFixed(3)}ms</p>
          <p>• 区间合并: {metrics.mergeTime.toFixed(3)}ms</p>
        </div>
      </CardContent>
    </Card>
  );
}
