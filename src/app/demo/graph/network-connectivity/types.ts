'use client';

/**
 * 节点类型
 */
export interface NetworkNode {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'checking';
}

/**
 * 边类型
 */
export interface NetworkEdge {
  from: string;
  to: string;
}

/**
 * 连通分量结果
 */
export interface ComponentResult {
  id: number;
  nodes: NetworkNode[];
  isHealthy: boolean;
}
