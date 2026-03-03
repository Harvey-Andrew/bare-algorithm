'use client';

import { Activity, Clock, Database, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONFIG } from '../constants';
import type { PerformanceMetrics } from '../types';

interface PerformanceMetricsPanelProps {
  metrics: PerformanceMetrics;
}

/**
 * 性能指标面板
 */
export function PerformanceMetricsPanel({ metrics }: PerformanceMetricsPanelProps) {
  const isQueryFast = metrics.lastQueryTime < CONFIG.QUERY_WARN_THRESHOLD;
  const isBuildFast = metrics.prefixSumBuildTime < CONFIG.LONG_TASK_THRESHOLD;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          性能指标
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Zap className="w-3 h-3" />
              前缀和构建
            </div>
            <div
              className={`text-sm font-mono ${isBuildFast ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {metrics.prefixSumBuildTime.toFixed(2)} ms
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-3 h-3" />
              区间查询
            </div>
            <div className={`text-sm font-mono ${isQueryFast ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.lastQueryTime.toFixed(2)} ms
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Database className="w-3 h-3" />
              总事件数
            </div>
            <div className="text-sm font-mono text-cyan-400">
              {metrics.totalEvents.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Database className="w-3 h-3" />
              内存占用
            </div>
            <div className="text-sm font-mono text-purple-400">{metrics.memoryUsage} KB</div>
          </div>
        </div>

        {/* 复杂度说明 */}
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400">
          <div className="font-medium text-slate-300 mb-1">算法复杂度</div>
          <div>• 前缀和构建: O(n)</div>
          <div>• 区间查询: O(1)</div>
          <div>• 差分更新: O(1) 更新, O(n) 还原</div>
        </div>
      </CardContent>
    </Card>
  );
}
