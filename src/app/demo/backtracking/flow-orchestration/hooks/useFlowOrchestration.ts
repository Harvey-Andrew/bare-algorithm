'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_NODES } from '../constants';
import type { ExecutionPath, FlowNode } from '../types';

function generatePaths(nodes: FlowNode[]): ExecutionPath[] {
  const paths: ExecutionPath[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => inDegree.set(n.id, n.dependencies.length));

  function backtrack(current: string[], remaining: Set<string>) {
    if (remaining.size === 0) {
      paths.push({ id: `path-${paths.length}`, sequence: [...current] });
      return;
    }

    for (const nodeId of remaining) {
      const node = nodeMap.get(nodeId)!;
      if (node.dependencies.every((dep) => current.includes(dep))) {
        current.push(nodeId);
        remaining.delete(nodeId);
        backtrack(current, remaining);
        remaining.add(nodeId);
        current.pop();
      }
    }
  }

  backtrack([], new Set(nodes.map((n) => n.id)));
  return paths;
}

export function useFlowOrchestration() {
  const [nodes] = useState<FlowNode[]>(DEFAULT_NODES);
  const [paths, setPaths] = useState<ExecutionPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<ExecutionPath | null>(null);

  const generate = useCallback(() => {
    const result = generatePaths(nodes);
    setPaths(result);
    setSelectedPath(result[0] || null);
  }, [nodes]);

  return { nodes, paths, selectedPath, setSelectedPath, generate };
}
