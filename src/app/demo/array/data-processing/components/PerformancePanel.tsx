'use client';

import { Activity, Clock, Cpu, Database } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONFIG } from '../constants';
import type { PerformanceMetrics } from '../types';

interface PerformancePanelProps {
  metrics: PerformanceMetrics;
}

/**
 * 性能指标面板
 */
export function PerformancePanel({ metrics }: PerformancePanelProps) {
  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;

  const isSlowSort = metrics.sortTime > CONFIG.WARN_THRESHOLD;
  const isSlowFilter = metrics.filterTime > CONFIG.WARN_THRESHOLD;
  const isLongTask = metrics.totalTime > CONFIG.LONG_TASK_THRESHOLD;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          性能指标
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 数据规模 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-4 h-4" />
            <span className="text-sm">数据规模</span>
          </div>
          <span className="text-white font-mono">{metrics.recordCount.toLocaleString()} 条</span>
        </div>

        {/* 排序耗时 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">排序耗时</span>
          </div>
          <span className={`font-mono ${isSlowSort ? 'text-yellow-400' : 'text-green-400'}`}>
            {formatTime(metrics.sortTime)}
          </span>
        </div>

        {/* 筛选耗时 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu className="w-4 h-4" />
            <span className="text-sm">筛选耗时</span>
          </div>
          <span className={`font-mono ${isSlowFilter ? 'text-yellow-400' : 'text-green-400'}`}>
            {formatTime(metrics.filterTime)}
          </span>
        </div>

        {/* 分组耗时 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">分组统计</span>
          </div>
          <span className="text-green-400 font-mono">{formatTime(metrics.groupTime)}</span>
        </div>

        {/* 总耗时 */}
        <div
          className={`p-3 rounded border ${isLongTask ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}
        >
          <div className="flex items-center justify-between">
            <span className={isLongTask ? 'text-yellow-400' : 'text-cyan-400'}>总处理时间</span>
            <span
              className={`font-mono font-bold ${isLongTask ? 'text-yellow-400' : 'text-cyan-400'}`}
            >
              {formatTime(metrics.totalTime)}
            </span>
          </div>
          {isLongTask && (
            <p className="text-xs text-yellow-300/70 mt-1">
              ⚠️ 超过 {CONFIG.LONG_TASK_THRESHOLD}ms 长任务阈值
            </p>
          )}
        </div>

        {/* 复杂度说明 */}
        <div className="text-xs text-slate-500 mt-2">
          <p>• 排序：O(n log n) 快速排序</p>
          <p>• 筛选：O(n) 遍历</p>
          <p>• 分组：O(n) 哈希映射</p>
        </div>
      </CardContent>
    </Card>
  );
}
