import type { GraphEdge, GraphNode } from '../types';

/**
 * 找连通分量
 */
export function findConnectedComponents(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Map<string, number> {
  const parent = new Map<string, string>();
  nodes.forEach((n) => parent.set(n.id, n.id));

  const find = (x: string): string => {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  };

  const union = (a: string, b: string) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) {
      parent.set(pa, pb);
    }
  };

  edges.forEach((e) => union(e.source, e.target));

  const componentMap = new Map<string, number>();
  const componentIds = new Map<string, number>();
  let componentCount = 0;

  nodes.forEach((n) => {
    const root = find(n.id);
    if (!componentIds.has(root)) {
      componentIds.set(root, componentCount++);
    }
    componentMap.set(n.id, componentIds.get(root)!);
  });

  return componentMap;
}

/**
 * BFS 最短路径
 */
export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: string,
  end: string
): string[] | null {
  const graph = new Map<string, string[]>();
  nodes.forEach((n) => graph.set(n.id, []));
  edges.forEach((e) => {
    graph.get(e.source)?.push(e.target);
    graph.get(e.target)?.push(e.source);
  });

  const queue: Array<{ node: string; path: string[] }> = [{ node: start, path: [start] }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (node === end) return path;
    if (visited.has(node)) continue;
    visited.add(node);

    graph.get(node)?.forEach((next) => {
      if (!visited.has(next)) {
        queue.push({ node: next, path: [...path, next] });
      }
    });
  }

  return null;
}

/**
 * 找共同好友
 */
export function findMutualFriends(edges: GraphEdge[], person1: string, person2: string): string[] {
  const getFriends = (id: string) => {
    const friends = new Set<string>();
    edges.forEach((e) => {
      if (e.source === id) friends.add(e.target);
      if (e.target === id) friends.add(e.source);
    });
    return friends;
  };

  const friends1 = getFriends(person1);
  const friends2 = getFriends(person2);
  const mutual: string[] = [];

  friends1.forEach((f) => {
    if (friends2.has(f)) mutual.push(f);
  });

  return mutual;
}
