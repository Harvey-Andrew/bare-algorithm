'use client';

import { Activity, Clock, Database, Gauge, Layers } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PERFORMANCE_CONFIG } from '../constants';
import type { PerformanceMetrics, VisibleRange } from '../types';

interface ScrollInfoProps {
  metrics: PerformanceMetrics;
  visibleRange: VisibleRange;
}

/**
 * 滚动信息与性能指标面板
 */
export function ScrollInfo({ metrics, visibleRange }: ScrollInfoProps) {
  const isSlowCalc = metrics.lastCalcTime > PERFORMANCE_CONFIG.LONG_TASK_THRESHOLD;
  const isLowFps = metrics.fps < 30;

  const formatPercent = (ratio: number) => `${(ratio * 100).toFixed(4)}%`;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          性能监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 数据规模 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-4 h-4" />
            <span className="text-sm">总数据量</span>
          </div>
          <span className="text-white font-mono">{metrics.totalItems.toLocaleString()} 条</span>
        </div>

        {/* 实际渲染 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-4 h-4" />
            <span className="text-sm">实际渲染</span>
          </div>
          <span className="text-cyan-400 font-mono">{metrics.renderedItems} 条</span>
        </div>

        {/* 渲染比例 */}
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
          <div className="flex items-center justify-between">
            <span className="text-green-400">渲染比例</span>
            <span className="text-green-400 font-mono font-bold">
              {formatPercent(metrics.renderRatio)}
            </span>
          </div>
          <p className="text-xs text-green-300/70 mt-1">
            仅渲染可见区域，节省 {(100 - metrics.renderRatio * 100).toFixed(2)}% 的 DOM 节点
          </p>
        </div>

        {/* 可见范围 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">可见区间</span>
          </div>
          <span className="text-white font-mono">
            [{visibleRange.startIndex} - {visibleRange.endIndex}]
          </span>
        </div>

        {/* 计算耗时 */}
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">计算耗时</span>
          </div>
          <span className={`font-mono ${isSlowCalc ? 'text-yellow-400' : 'text-green-400'}`}>
            {metrics.lastCalcTime.toFixed(3)}ms
          </span>
        </div>

        {/* FPS */}
        <div
          className={`p-3 rounded border ${isLowFps ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              <span className={isLowFps ? 'text-yellow-400' : 'text-cyan-400'}>FPS</span>
            </div>
            <span
              className={`font-mono font-bold text-xl ${isLowFps ? 'text-yellow-400' : 'text-cyan-400'}`}
            >
              {metrics.fps}
            </span>
          </div>
          {isLowFps && <p className="text-xs text-yellow-300/70 mt-1">⚠️ 帧率偏低</p>}
        </div>

        {/* 算法说明 */}
        <div className="text-xs text-slate-500 mt-2">
          <p>• 索引计算：O(1) 直接定位</p>
          <p>• 数据切片：O(k) k=可见项数</p>
          <p>• 滚动渲染：transform 优化</p>
        </div>
      </CardContent>
    </Card>
  );
}
