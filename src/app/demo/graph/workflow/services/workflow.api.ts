import type { CriticalPathResult, TaskEdge, TaskNode } from '../types';

/**
 * 计算关键路径（CPM - Critical Path Method）
 */
export function findCriticalPath(tasks: TaskNode[], edges: TaskEdge[]): CriticalPathResult {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // 初始化
  tasks.forEach((t) => {
    graph.set(t.id, []);
    inDegree.set(t.id, 0);
  });

  // 构建图
  edges.forEach((e) => {
    graph.get(e.from)?.push(e.to);
    inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
  });

  // 正向扫描：计算最早开始时间
  const earliestStart = new Map<string, number>();
  const queue: string[] = [];

  tasks.forEach((t) => {
    if (inDegree.get(t.id) === 0) {
      queue.push(t.id);
      earliestStart.set(t.id, 0);
    }
  });

  const topoOrder: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    topoOrder.push(node);

    graph.get(node)?.forEach((next) => {
      const es = earliestStart.get(node)! + (taskMap.get(node)?.duration || 0);
      if (!earliestStart.has(next) || es > earliestStart.get(next)!) {
        earliestStart.set(next, es);
      }

      inDegree.set(next, (inDegree.get(next) || 0) - 1);
      if (inDegree.get(next) === 0) {
        queue.push(next);
      }
    });
  }

  // 找到结束节点的最早完成时间
  let maxEnd = 0;
  let endNode = '';
  tasks.forEach((t) => {
    const endTime = (earliestStart.get(t.id) || 0) + t.duration;
    if (endTime >= maxEnd) {
      maxEnd = endTime;
      endNode = t.id;
    }
  });

  // 反向追踪关键路径
  const criticalPath: string[] = [];
  const latestFinish = new Map<string, number>();
  latestFinish.set(endNode, maxEnd);

  // 逆序计算最晚完成时间
  for (let i = topoOrder.length - 1; i >= 0; i--) {
    const node = topoOrder[i];
    const successors = graph.get(node) || [];

    if (successors.length === 0) {
      latestFinish.set(node, maxEnd);
    } else {
      let minLF = Infinity;
      successors.forEach((succ) => {
        const lf = (latestFinish.get(succ) || maxEnd) - (taskMap.get(succ)?.duration || 0);
        minLF = Math.min(minLF, lf);
      });
      latestFinish.set(node, minLF);
    }
  }

  // 关键路径：最早开始 = 最晚开始的节点
  topoOrder.forEach((node) => {
    const es = earliestStart.get(node) || 0;
    const lf = latestFinish.get(node) || 0;
    const ls = lf - (taskMap.get(node)?.duration || 0);
    if (Math.abs(es - ls) < 0.001) {
      criticalPath.push(node);
    }
  });

  return { criticalPath, totalDuration: maxEnd, earliestStart };
}

/**
 * 获取影响范围（选中节点的下游）
 */
export function getAffectedNodes(nodeId: string, edges: TaskEdge[]): Set<string> {
  const affected = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const node = queue.shift()!;
    affected.add(node);
    edges.forEach((e) => {
      if (e.from === node && !affected.has(e.to)) {
        queue.push(e.to);
      }
    });
  }

  return affected;
}
