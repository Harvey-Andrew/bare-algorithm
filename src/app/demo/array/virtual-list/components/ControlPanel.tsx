'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Hash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ControlPanelProps {
  totalItems: number;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  onScrollToIndex: (index: number) => void;
}

/**
 * 控制面板组件
 */
export function ControlPanel({
  totalItems,
  onScrollToTop,
  onScrollToBottom,
  onScrollToIndex,
}: ControlPanelProps) {
  const [targetIndex, setTargetIndex] = useState<string>('');

  const handleJump = () => {
    const index = parseInt(targetIndex, 10);
    if (!isNaN(index) && index >= 0 && index < totalItems) {
      onScrollToIndex(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  const quickJumpIndexes = [0, 1000, 10000, 50000, 99999];

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">滚动控制</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 顶部/底部 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onScrollToTop}
            className="flex-1 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            顶部
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onScrollToBottom}
            className="flex-1 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            底部
          </Button>
        </div>

        {/* 跳转到指定索引 */}
        <div>
          <label className="block text-sm text-slate-400 mb-1">跳转到索引</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={targetIndex}
              onChange={(e) => setTargetIndex(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              max={totalItems - 1}
              placeholder={`0 - ${totalItems - 1}`}
              className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
            />
            <Button size="sm" variant="outline" onClick={handleJump} className="cursor-pointer">
              <Hash className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 快速跳转 */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">快速跳转</label>
          <div className="flex flex-wrap gap-2">
            {quickJumpIndexes
              .filter((i) => i < totalItems)
              .map((index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onScrollToIndex(index)}
                  className="cursor-pointer text-xs"
                >
                  #{index.toLocaleString()}
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
