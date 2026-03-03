import type { ComponentResult, NetworkEdge, NetworkNode } from '../types';

/**
 * BFS 检测连通分量
 */
export function detectComponents(nodes: NetworkNode[], edges: NetworkEdge[]): ComponentResult[] {
  const nodeIds = nodes.map((n) => n.id);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const components: ComponentResult[] = [];

  // 构建邻接表
  const adjList = new Map<string, string[]>();
  for (const id of nodeIds) {
    adjList.set(id, []);
  }
  for (const edge of edges) {
    adjList.get(edge.from)?.push(edge.to);
    adjList.get(edge.to)?.push(edge.from);
  }

  let componentId = 0;
  for (const startId of nodeIds) {
    if (visited.has(startId)) continue;

    // BFS
    const queue: string[] = [startId];
    const componentNodes: NetworkNode[] = [];
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = nodeMap.get(current);
      if (node) componentNodes.push(node);

      for (const neighbor of adjList.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // 判断是否健康（所有节点都在线）
    const isHealthy = componentNodes.every((n) => n.status === 'online');
    components.push({ id: componentId++, nodes: componentNodes, isHealthy });
  }

  return components;
}
