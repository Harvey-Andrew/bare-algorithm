'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeBucket } from '../types';

interface TimeSeriesChartProps {
  buckets: TimeBucket[];
  selectedRange: [number, number];
  onRangeChange: (start: number, end: number) => void;
}

/**
 * 时序图表组件 - 展示销售额趋势
 */
export function TimeSeriesChart({ buckets, selectedRange, onRangeChange }: TimeSeriesChartProps) {
  const maxAmount = useMemo(() => {
    if (buckets.length === 0) return 1;
    return Math.max(...buckets.map((b) => Math.abs(b.totalAmount)), 1);
  }, [buckets]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toFixed(0)}`;
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">销售额趋势</CardTitle>
        <CardDescription>点击柱状图选择区间起点/终点</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end gap-1 overflow-x-auto pb-6 relative">
          {buckets.slice(0, 60).map((bucket, idx) => {
            // 使用像素高度而非百分比
            const heightPx = Math.max(8, (Math.abs(bucket.totalAmount) / maxAmount) * 200);
            const isSelected = idx >= selectedRange[0] && idx <= selectedRange[1];
            const isNegative = bucket.totalAmount < 0;

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-end min-w-[12px] h-full relative"
              >
                <div
                  className={`w-3 rounded-t cursor-pointer transition-all hover:opacity-80 ${
                    isSelected
                      ? isNegative
                        ? 'bg-red-500'
                        : 'bg-cyan-500'
                      : isNegative
                        ? 'bg-red-500/40'
                        : 'bg-purple-500/60'
                  }`}
                  style={{ height: `${heightPx}px` }}
                  onClick={() => {
                    if (selectedRange[0] === selectedRange[1] || idx < selectedRange[0]) {
                      onRangeChange(idx, selectedRange[1]);
                    } else {
                      onRangeChange(selectedRange[0], idx);
                    }
                  }}
                  title={`${formatTime(bucket.timestamp)}\n${formatAmount(bucket.totalAmount)}\n${bucket.orderCount}笔订单`}
                />
              </div>
            );
          })}
        </div>
        {/* 时间标签 */}
        <div className="flex gap-1 overflow-x-auto text-xs text-slate-500 mt-1">
          {buckets.slice(0, 60).map((bucket, idx) =>
            idx % 10 === 0 ? (
              <span
                key={idx}
                className="min-w-[12px] text-center"
                style={{ marginLeft: idx === 0 ? 0 : `${(10 - 1) * 13}px` }}
              >
                {formatTime(bucket.timestamp)}
              </span>
            ) : null
          )}
        </div>
        <div className="text-xs text-slate-500 mt-2">
          已选区间: {selectedRange[0]} - {selectedRange[1]} (共{' '}
          {selectedRange[1] - selectedRange[0] + 1} 分钟)
        </div>
      </CardContent>
    </Card>
  );
}
