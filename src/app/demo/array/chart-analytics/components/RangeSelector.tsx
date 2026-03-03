'use client';

import { Minus, Plus, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RangeSelectorProps {
  selectedRange: [number, number];
  maxIndex: number;
  onRangeChange: (start: number, end: number) => void;
  onQuery: () => void;
}

/**
 * 区间选择器组件
 */
export function RangeSelector({
  selectedRange,
  maxIndex,
  onRangeChange,
  onQuery,
}: RangeSelectorProps) {
  const adjustStart = (delta: number) => {
    const newStart = Math.max(0, Math.min(selectedRange[1], selectedRange[0] + delta));
    onRangeChange(newStart, selectedRange[1]);
  };

  const adjustEnd = (delta: number) => {
    const newEnd = Math.max(selectedRange[0], Math.min(maxIndex, selectedRange[1] + delta));
    onRangeChange(selectedRange[0], newEnd);
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-base">区间选择</CardTitle>
        <CardDescription>使用前缀和实现 O(1) 区间查询</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 起点控制 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">起点索引</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustStart(-1)}
              className="cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-12 text-center font-mono">{selectedRange[0]}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustStart(1)}
              className="cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 终点控制 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">终点索引</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustEnd(-1)}
              className="cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-12 text-center font-mono">{selectedRange[1]}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => adjustEnd(1)}
              className="cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* 查询按钮 */}
        <Button className="w-full cursor-pointer" onClick={onQuery}>
          <Search className="w-4 h-4 mr-2" />
          执行区间查询
        </Button>
      </CardContent>
    </Card>
  );
}
