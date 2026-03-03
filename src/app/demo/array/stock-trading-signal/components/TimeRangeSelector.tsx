'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STOCK_INFO } from '../constants';
import type { PerformanceMetrics, TimeRange } from '../types';

interface TimeRangeSelectorProps {
  currentRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  metrics: PerformanceMetrics;
}

const TIME_RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

/**
 * 时间范围选择器组件
 */
export function TimeRangeSelector({
  currentRange,
  onRangeChange,
  metrics,
}: TimeRangeSelectorProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">
          {STOCK_INFO.name}
          <span className="text-sm text-slate-400 ml-2">{STOCK_INFO.code}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 行业标签 */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
            {STOCK_INFO.industry}
          </span>
        </div>

        {/* 时间范围选择 */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">时间范围</label>
          <div className="flex gap-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range}
                variant={currentRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => onRangeChange(range)}
                className="flex-1 cursor-pointer"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* 性能指标 */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">数据点</span>
            <span className="text-white font-mono">{metrics.dataPoints}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">分析耗时</span>
            <span className="text-green-400 font-mono">{metrics.analysisTime.toFixed(3)}ms</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">MA 计算</span>
            <span className="text-green-400 font-mono">{metrics.maCalcTime.toFixed(3)}ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
