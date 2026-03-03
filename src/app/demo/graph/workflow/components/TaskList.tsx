'use client';

import { Loader2, Play, RefreshCw, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CriticalPathResult, TaskNode } from '../types';

interface TaskListProps {
  tasks: TaskNode[];
  result: CriticalPathResult | null;
  selectedTask: string | null;
  isAnalyzing: boolean;
  onTaskClick: (taskId: string) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
}

/**
 * 任务列表组件
 */
export function TaskList({
  tasks,
  result,
  selectedTask,
  isAnalyzing,
  onTaskClick,
  onRunAnalysis,
  onReset,
}: TaskListProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" /> 任务列表
          </CardTitle>
          <CardDescription>点击任务查看影响范围</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              onClick={() => onTaskClick(t.id)}
              className={`p-3 rounded cursor-pointer transition-all ${
                selectedTask === t.id
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              } ${result?.criticalPath.includes(t.id) ? 'ring-2 ring-red-500/50' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{t.name}</span>
                <span className="text-sm text-slate-400">{t.duration} 天</span>
              </div>
              {result && (
                <div className="text-xs text-slate-500 mt-1">
                  第 {result.earliestStart.get(t.id)} 天开始
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button className="flex-1 cursor-pointer" onClick={onRunAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          分析关键路径
        </Button>
        <Button variant="outline" onClick={onReset} className="cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
