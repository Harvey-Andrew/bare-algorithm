'use client';

import { Network, RefreshCw, Wifi } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  isChecking: boolean;
  onCheck: () => void;
  onReset: () => void;
}

/**
 * 控制面板组件
 */
export function ControlPanel({ isChecking, onCheck, onReset }: ControlPanelProps) {
  return (
    <div className="flex gap-3">
      <Button onClick={onCheck} disabled={isChecking} className="flex-1 cursor-pointer">
        {isChecking ? (
          <>
            <Network className="h-4 w-4 mr-2 animate-pulse" />
            检测中...
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 mr-2" />
            检测连通性
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
