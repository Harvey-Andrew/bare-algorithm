import type { AnalysisResult, Dependency, Module, NodePosition } from '../types';

/**
 * 拓扑排序（Kahn算法）
 * @param modules 模块列表
 * @param deps 依赖关系列表
 * @returns 分析结果，包含排序顺序、是否有环、环节点集合
 */
export function topologicalSort(modules: Module[], deps: Dependency[]): AnalysisResult {
  const inDegree: Map<string, number> = new Map();
  const graph: Map<string, string[]> = new Map();

  // 初始化
  modules.forEach((m) => {
    inDegree.set(m.id, 0);
    graph.set(m.id, []);
  });

  // 构建图
  deps.forEach((d) => {
    if (graph.has(d.from) && inDegree.has(d.to)) {
      graph.get(d.from)!.push(d.to);
      inDegree.set(d.to, (inDegree.get(d.to) || 0) + 1);
    }
  });

  // Kahn算法
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const order: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    graph.get(node)?.forEach((neighbor) => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  // 检测环
  const hasCycle = order.length !== modules.length;
  const cycleNodes = new Set<string>();
  if (hasCycle) {
    inDegree.forEach((deg, id) => {
      if (deg > 0) cycleNodes.add(id);
    });
  }

  return { order: hasCycle ? null : order, hasCycle, cycleNodes };
}

/**
 * 计算节点的分层布局位置
 * @param modules 模块列表
 * @param deps 依赖关系列表
 * @param svgWidth SVG 宽度
 * @param svgHeight SVG 高度
 * @returns 节点位置映射
 */
export function calculateNodePositions(
  modules: Module[],
  deps: Dependency[],
  svgWidth: number,
  svgHeight: number
): Map<string, NodePosition> {
  const positions: Map<string, NodePosition> = new Map();
  const layers: string[][] = [];

  // 简单分层：按入度
  const inDegree: Map<string, number> = new Map();
  modules.forEach((m) => inDegree.set(m.id, 0));
  deps.forEach((d) => {
    if (inDegree.has(d.to)) {
      inDegree.set(d.to, (inDegree.get(d.to) || 0) + 1);
    }
  });

  const remaining = new Set(modules.map((m) => m.id));
  while (remaining.size > 0) {
    const layer: string[] = [];
    remaining.forEach((id) => {
      const deg = inDegree.get(id) || 0;
      if (deg === 0) layer.push(id);
    });
    if (layer.length === 0) {
      // 有环时强制取出
      const firstRemaining = remaining.values().next().value as string;
      layer.push(firstRemaining);
    }
    layer.forEach((id) => {
      remaining.delete(id);
      deps.forEach((d) => {
        if (d.from === id && inDegree.has(d.to)) {
          inDegree.set(d.to, Math.max(0, (inDegree.get(d.to) || 0) - 1));
        }
      });
    });
    layers.push(layer);
  }

  // 计算位置
  const layerHeight = svgHeight / (layers.length + 1);
  layers.forEach((layer, layerIdx) => {
    const layerWidth = svgWidth / (layer.length + 1);
    layer.forEach((id, nodeIdx) => {
      positions.set(id, {
        x: layerWidth * (nodeIdx + 1),
        y: layerHeight * (layerIdx + 1),
      });
    });
  });

  return positions;
}
