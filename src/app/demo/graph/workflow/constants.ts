import type { NodePosition, TaskEdge, TaskNode } from './types';

/**
 * 默认任务列表
 */
export const DEFAULT_TASKS: TaskNode[] = [
  { id: 'start', name: '开始', duration: 0 },
  { id: 'design', name: '需求设计', duration: 3 },
  { id: 'frontend', name: '前端开发', duration: 5 },
  { id: 'backend', name: '后端开发', duration: 4 },
  { id: 'test', name: '测试', duration: 2 },
  { id: 'deploy', name: '部署', duration: 1 },
  { id: 'end', name: '完成', duration: 0 },
];

/**
 * 默认依赖关系
 */
export const DEFAULT_EDGES: TaskEdge[] = [
  { from: 'start', to: 'design' },
  { from: 'design', to: 'frontend' },
  { from: 'design', to: 'backend' },
  { from: 'frontend', to: 'test' },
  { from: 'backend', to: 'test' },
  { from: 'test', to: 'deploy' },
  { from: 'deploy', to: 'end' },
];

/**
 * SVG 布局常量
 */
export const SVG_CONFIG = {
  width: 700,
  height: 400,
  nodeWidth: 80,
  nodeHeight: 50,
};

/**
 * 节点位置映射
 */
export const NODE_POSITIONS: Map<string, NodePosition> = new Map([
  ['start', { x: 50, y: 200 }],
  ['design', { x: 180, y: 200 }],
  ['frontend', { x: 330, y: 120 }],
  ['backend', { x: 330, y: 280 }],
  ['test', { x: 480, y: 200 }],
  ['deploy', { x: 580, y: 200 }],
  ['end', { x: 680, y: 200 }],
]);
