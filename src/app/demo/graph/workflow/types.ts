'use client';

/**
 * 任务节点
 */
export interface TaskNode {
  id: string;
  name: string;
  duration: number;
}

/**
 * 任务边（依赖关系）
 */
export interface TaskEdge {
  from: string;
  to: string;
}

/**
 * 关键路径分析结果
 */
export interface CriticalPathResult {
  criticalPath: string[];
  totalDuration: number;
  earliestStart: Map<string, number>;
}

/**
 * 节点位置
 */
export interface NodePosition {
  x: number;
  y: number;
}
