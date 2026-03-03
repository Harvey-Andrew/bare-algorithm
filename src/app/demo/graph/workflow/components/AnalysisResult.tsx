'use client';

import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CriticalPathResult, TaskNode } from '../types';

interface AnalysisResultProps {
  tasks: TaskNode[];
  result: CriticalPathResult | null;
  selectedTask: string | null;
  affectedNodes: Set<string>;
}

/**
 * 分析结果卡片组件
 */
export function AnalysisResult({
  tasks,
  result,
  selectedTask,
  affectedNodes,
}: AnalysisResultProps) {
  if (!result && !selectedTask) return null;

  return (
    <div className="space-y-4">
      {/* 分析结果 */}
      {result && (
        <Card className="border-green-500/50 bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 text-green-400" /> 分析结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-slate-400">项目总工期：</span>
              <span className="text-xl font-bold text-green-400 ml-2">
                {result.totalDuration} 天
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-2">关键路径：</p>
              <div className="flex flex-wrap gap-1">
                {result.criticalPath.map((id, i) => (
                  <React.Fragment key={id}>
                    <span className="px-2 py-1 bg-red-500/20 rounded text-red-300 text-sm">
                      {tasks.find((t) => t.id === id)?.name}
                    </span>
                    {i < result.criticalPath.length - 1 && (
                      <span className="text-slate-500">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 影响分析 */}
      {selectedTask && (
        <Card className="border-orange-500/50 bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-orange-400" /> 影响分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-300 mb-2">
              如果 &ldquo;{tasks.find((t) => t.id === selectedTask)?.name}&rdquo; 延期，将影响：
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(affectedNodes)
                .filter((id) => id !== selectedTask)
                .map((id) => (
                  <span
                    key={id}
                    className="px-2 py-1 bg-orange-500/20 rounded text-orange-300 text-sm"
                  >
                    {tasks.find((t) => t.id === id)?.name}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
