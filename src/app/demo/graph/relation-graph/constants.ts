import type { GraphEdge, InitialNode, SvgConfig } from './types';

/**
 * 默认数据（社交网络）
 */
export const DEFAULT_NODES: InitialNode[] = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'charlie', name: 'Charlie' },
  { id: 'david', name: 'David' },
  { id: 'eve', name: 'Eve' },
  { id: 'frank', name: 'Frank' },
  { id: 'grace', name: 'Grace' },
  { id: 'henry', name: 'Henry' },
];

/**
 * 默认边
 */
export const DEFAULT_EDGES: GraphEdge[] = [
  { source: 'alice', target: 'bob' },
  { source: 'alice', target: 'charlie' },
  { source: 'bob', target: 'charlie' },
  { source: 'bob', target: 'david' },
  { source: 'charlie', target: 'eve' },
  { source: 'david', target: 'eve' },
  { source: 'frank', target: 'grace' },
  { source: 'grace', target: 'henry' },
];

/**
 * SVG 配置
 */
export const SVG_CONFIG: SvgConfig = {
  width: 600,
  height: 400,
  nodeRadius: 25,
};

/**
 * 颜色列表
 */
export const COLORS = ['#8b5cf6', '#22c55e', '#f97316', '#ef4444', '#3b82f6', '#ec4899'];
