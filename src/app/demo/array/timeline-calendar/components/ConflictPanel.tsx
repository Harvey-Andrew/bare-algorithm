'use client';

import { AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, formatTime } from '../services/interval.api';
import type { ConflictInfo } from '../types';

interface ConflictPanelProps {
  conflicts: ConflictInfo[];
}

/**
 * 冲突提示面板组件
 */
export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  if (conflicts.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-400" />
            冲突检测
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400">✓ 未检测到会议时间冲突</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          冲突检测
          <span className="text-sm font-normal text-yellow-400">({conflicts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {conflicts.slice(0, 5).map((conflict, idx) => (
            <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-white">
                    <span className="font-medium">{conflict.meeting1.title}</span>
                    <span className="text-slate-400"> 与 </span>
                    <span className="font-medium">{conflict.meeting2.title}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    重叠时段: {formatTime(conflict.overlapStart)} -{' '}
                    {formatTime(conflict.overlapEnd)}
                  </div>
                </div>
                <span className="text-xs text-yellow-400 font-mono">
                  {formatDuration(conflict.overlapMinutes)}
                </span>
              </div>
            </div>
          ))}
          {conflicts.length > 5 && (
            <p className="text-xs text-slate-500 text-center">
              还有 {conflicts.length - 5} 个冲突...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
