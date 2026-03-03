'use client';

import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_EDGES, DEFAULT_TASKS } from '../constants';
import { findCriticalPath, getAffectedNodes } from '../services/workflow.api';
import type { CriticalPathResult, TaskEdge, TaskNode } from '../types';

/**
 * 工作流状态管理 Hook
 */
export function useWorkflow() {
  const [tasks] = useState<TaskNode[]>(DEFAULT_TASKS);
  const [edges] = useState<TaskEdge[]>(DEFAULT_EDGES);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CriticalPathResult | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // 运行分析
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = findCriticalPath(tasks, edges);
      setResult(res);
      setIsAnalyzing(false);
    }, 500);
  }, [tasks, edges]);

  // 重置
  const reset = useCallback(() => {
    setResult(null);
    setSelectedTask(null);
  }, []);

  // 切换选中任务
  const toggleTask = useCallback((taskId: string) => {
    setSelectedTask((prev) => (prev === taskId ? null : taskId));
  }, []);

  // 计算影响范围
  const affectedNodes = useMemo(() => {
    return selectedTask ? getAffectedNodes(selectedTask, edges) : new Set<string>();
  }, [selectedTask, edges]);

  return {
    // 数据
    tasks,
    edges,
    result,
    selectedTask,
    affectedNodes,
    isAnalyzing,

    // 操作
    runAnalysis,
    reset,
    toggleTask,
  };
}
