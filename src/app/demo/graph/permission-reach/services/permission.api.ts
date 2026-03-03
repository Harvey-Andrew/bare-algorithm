import type { PageLink, PageNode, PathResult } from '../types';

/**
 * BFS 查找可达路径
 */
export function findPath(
  pages: PageNode[],
  links: PageLink[],
  start: string,
  target: string,
  userPermissions: string[]
): PathResult {
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const graph = new Map<string, string[]>();

  pages.forEach((p) => graph.set(p.id, []));
  links.forEach((l) => {
    graph.get(l.from)?.push(l.to);
  });

  // BFS
  const queue: Array<{ node: string; path: string[] }> = [{ node: start, path: [start] }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;

    if (visited.has(node)) continue;
    visited.add(node);

    // 检查权限
    const page = pageMap.get(node);
    if (page && !userPermissions.includes(page.requiredRole)) {
      return { path: null, reachable: false, blockedAt: node };
    }

    if (node === target) {
      return { path, reachable: true, blockedAt: null };
    }

    graph.get(node)?.forEach((next) => {
      if (!visited.has(next)) {
        queue.push({ node: next, path: [...path, next] });
      }
    });
  }

  return { path: null, reachable: false, blockedAt: null };
}

/**
 * 获取所有可达页面
 */
export function getAllReachablePages(
  pages: PageNode[],
  links: PageLink[],
  start: string,
  userPermissions: string[]
): Set<string> {
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const graph = new Map<string, string[]>();

  pages.forEach((p) => graph.set(p.id, []));
  links.forEach((l) => {
    graph.get(l.from)?.push(l.to);
  });

  const reachable = new Set<string>();
  const queue = [start];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (reachable.has(node)) continue;

    const page = pageMap.get(node);
    if (page && !userPermissions.includes(page.requiredRole)) {
      continue;
    }

    reachable.add(node);
    graph.get(node)?.forEach((next) => {
      if (!reachable.has(next)) {
        queue.push(next);
      }
    });
  }

  return reachable;
}
