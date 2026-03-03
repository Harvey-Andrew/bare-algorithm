'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_EDGES, DEFAULT_NODES } from '../constants';
import { detectComponents } from '../services/network.api';
import type { ComponentResult, NetworkEdge, NetworkNode } from '../types';

/**
 * 网络连通性状态管理 Hook
 */
export function useNetworkConnectivity() {
  const [nodes, setNodes] = useState<NetworkNode[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<NetworkEdge[]>(DEFAULT_EDGES);
  const [results, setResults] = useState<ComponentResult[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');

  // 运行检测
  const runCheck = useCallback(() => {
    setIsChecking(true);
    setTimeout(() => {
      const components = detectComponents(nodes, edges);
      setResults(components);
      setIsChecking(false);
    }, 600);
  }, [nodes, edges]);

  // 重置
  const reset = useCallback(() => {
    setNodes(DEFAULT_NODES);
    setEdges(DEFAULT_EDGES);
    setResults(null);
  }, []);

  // 添加节点
  const addNode = useCallback(() => {
    if (newNodeName) {
      const id = `node-${Date.now()}`;
      setNodes((prev) => [...prev, { id, name: newNodeName, status: 'online' }]);
      setNewNodeName('');
      setResults(null);
    }
  }, [newNodeName]);

  // 删除节点
  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setResults(null);
  }, []);

  // 切换节点状态
  const toggleNodeStatus = useCallback((id: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: n.status === 'online' ? 'offline' : 'online' } : n
      )
    );
    setResults(null);
  }, []);

  // 删除边
  const removeEdge = useCallback((from: string, to: string) => {
    setEdges((prev) =>
      prev.filter((e) => !(e.from === from && e.to === to) && !(e.from === to && e.to === from))
    );
    setResults(null);
  }, []);

  // 计算统计
  const unhealthyComponents = results?.filter((c) => !c.isHealthy) || [];
  const partitionCount = results ? results.length : 0;

  return {
    // 数据
    nodes,
    edges,
    results,
    isChecking,
    newNodeName,
    unhealthyComponents,
    partitionCount,

    // 操作
    setNewNodeName,
    runCheck,
    reset,
    addNode,
    removeNode,
    toggleNodeStatus,
    removeEdge,
  };
}
