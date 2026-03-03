import type { NetworkEdge, NetworkNode } from './types';

/**
 * 默认节点
 */
export const DEFAULT_NODES: NetworkNode[] = [
  { id: 'node-1', name: 'API Server 1', status: 'online' },
  { id: 'node-2', name: 'API Server 2', status: 'online' },
  { id: 'node-3', name: 'Database Master', status: 'online' },
  { id: 'node-4', name: 'Database Replica', status: 'online' },
  { id: 'node-5', name: 'Cache Server', status: 'online' },
  { id: 'node-6', name: 'Message Queue', status: 'offline' },
  { id: 'node-7', name: 'Worker 1', status: 'online' },
  { id: 'node-8', name: 'Worker 2', status: 'online' },
];

/**
 * 默认边 (连接关系)
 */
export const DEFAULT_EDGES: NetworkEdge[] = [
  { from: 'node-1', to: 'node-3' },
  { from: 'node-2', to: 'node-3' },
  { from: 'node-3', to: 'node-4' },
  { from: 'node-1', to: 'node-5' },
  { from: 'node-2', to: 'node-5' },
  // node-6 (Message Queue) 断开连接，模拟网络分区
  { from: 'node-7', to: 'node-6' },
  { from: 'node-8', to: 'node-6' },
];
