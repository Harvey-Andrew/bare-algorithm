'use client';

import { useCallback, useState } from 'react';

import { SAMPLE_DOM } from '../constants';
import type { TreeNode } from '../types';

type TraversalMode = 'dfs' | 'bfs';

function dfs(node: TreeNode, result: string[]) {
  result.push(node.id);
  for (const child of node.children) {
    dfs(child, result);
  }
}

function bfs(root: TreeNode): string[] {
  const result: string[] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.id);
    queue.push(...node.children);
  }
  return result;
}

export function useDomTraversal() {
  const [mode, setMode] = useState<TraversalMode>('dfs');
  const [traversalOrder, setTraversalOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const traverse = useCallback(() => {
    const result: string[] = [];
    if (mode === 'dfs') {
      dfs(SAMPLE_DOM, result);
    } else {
      result.push(...bfs(SAMPLE_DOM));
    }
    setTraversalOrder(result);
    setCurrentIndex(0);
  }, [mode]);

  const step = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, traversalOrder.length - 1));
  }, [traversalOrder.length]);

  const reset = useCallback(() => {
    setTraversalOrder([]);
    setCurrentIndex(-1);
  }, []);

  return { tree: SAMPLE_DOM, mode, setMode, traversalOrder, currentIndex, traverse, step, reset };
}
