'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_EDGES, DEFAULT_NODES, SVG_CONFIG } from '../constants';
import {
  findConnectedComponents,
  findMutualFriends,
  findShortestPath,
} from '../services/graph.api';
import type { GraphEdge, GraphNode } from '../types';

/**
 * 关系图状态管理 Hook
 */
export function useRelationGraph() {
  // 初始化节点位置
  const [nodes, setNodes] = useState<GraphNode[]>(() =>
    DEFAULT_NODES.map((n, i) => ({
      ...n,
      x: 150 + (i % 4) * 120 + 25,
      y: 100 + Math.floor(i / 4) * 150 + 25,
      vx: 0,
      vy: 0,
    }))
  );
  const [edges] = useState<GraphEdge[]>(DEFAULT_EDGES);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [shortestPath, setShortestPath] = useState<string[] | null>(null);
  const [mutualFriends, setMutualFriends] = useState<string[]>([]);

  const { width, height, nodeRadius } = SVG_CONFIG;

  // 简单力导向模拟
  useEffect(() => {
    if (nodes.length === 0) return;

    const interval = setInterval(() => {
      setNodes((prevNodes) => {
        const newNodes = prevNodes.map((n) => ({ ...n }));

        // 斥力
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 500 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }

        // 引力（边）
        edges.forEach((e) => {
          const sourceNode = newNodes.find((n) => n.id === e.source);
          const targetNode = newNodes.find((n) => n.id === e.target);
          if (!sourceNode || !targetNode) return;

          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 80) * 0.02;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        });

        // 中心引力
        newNodes.forEach((n) => {
          n.vx += (width / 2 - n.x) * 0.001;
          n.vy += (height / 2 - n.y) * 0.001;
        });

        // 应用速度
        newNodes.forEach((n) => {
          n.vx *= 0.9;
          n.vy *= 0.9;
          n.x += n.vx;
          n.y += n.vy;
          n.x = Math.max(nodeRadius, Math.min(width - nodeRadius, n.x));
          n.y = Math.max(nodeRadius, Math.min(height - nodeRadius, n.y));
        });

        return newNodes;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [nodes.length, edges, width, height, nodeRadius]);

  // 连通分量
  const components = useMemo(() => findConnectedComponents(nodes, edges), [nodes, edges]);

  // 点击节点
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNodes.includes(nodeId)) {
        setSelectedNodes(selectedNodes.filter((id) => id !== nodeId));
      } else if (selectedNodes.length < 2) {
        setSelectedNodes([...selectedNodes, nodeId]);
      } else {
        setSelectedNodes([nodeId]);
      }
      setShortestPath(null);
      setMutualFriends([]);
    },
    [selectedNodes]
  );

  // 查找最短路径
  const handleFindPath = useCallback(() => {
    if (selectedNodes.length === 2) {
      const path = findShortestPath(nodes, edges, selectedNodes[0], selectedNodes[1]);
      setShortestPath(path);
      const mutual = findMutualFriends(edges, selectedNodes[0], selectedNodes[1]);
      setMutualFriends(mutual);
    }
  }, [nodes, edges, selectedNodes]);

  // 重置
  const reset = useCallback(() => {
    setSelectedNodes([]);
    setShortestPath(null);
    setMutualFriends([]);
  }, []);

  return {
    // 数据
    nodes,
    edges,
    selectedNodes,
    shortestPath,
    mutualFriends,
    components,

    // 操作
    handleNodeClick,
    handleFindPath,
    reset,
  };
}
