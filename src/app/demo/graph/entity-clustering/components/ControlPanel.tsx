'use client';

import { Loader2, RefreshCw, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  isProcessing: boolean;
  onRunDetection: () => void;
  onReset: () => void;
}

/**
 * 控制面板组件
 */
export function ControlPanel({ isProcessing, onRunDetection, onReset }: ControlPanelProps) {
  return (
    <div className="flex gap-3">
      <Button onClick={onRunDetection} disabled={isProcessing} className="flex-1 cursor-pointer">
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            处理中...
          </>
        ) : (
          <>
            <Users className="h-4 w-4 mr-2" />
            开始检测
          </>
        )}
      </Button>
      <Button onClick={onReset} variant="outline" className="cursor-pointer">
        <RefreshCw className="h-4 w-4 mr-2" />
        重置
      </Button>
    </div>
  );
}
