import type { ClusterResult, DetectionResult, Entity } from '../types';

/**
 * 并查集数据结构
 */
class UnionFind {
  parent: number[];

  constructor(n: number) {
    this.parent = Array(n)
      .fill(0)
      .map((_, i) => i);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent[rootX] = rootY;
    }
  }
}

/**
 * 地址相似度判断
 */
export function isSimilarAddress(addr1: string, addr2: string): boolean {
  const normalize = (s: string) => s.replace(/[市区县省]/g, '').replace(/\s+/g, '');
  const a1 = normalize(addr1);
  const a2 = normalize(addr2);
  return a1.includes(a2) || a2.includes(a1);
}

/**
 * 检测重复实体
 */
export function detectDuplicates(entities: Entity[]): DetectionResult {
  const n = entities.length;
  const uf = new UnionFind(n);
  const matchReasons = new Map<string, string>();

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const e1 = entities[i];
      const e2 = entities[j];
      let reason = '';

      if (e1.phone === e2.phone) {
        reason = '电话相同';
      } else if (e1.name === e2.name && isSimilarAddress(e1.address, e2.address)) {
        reason = '姓名+地址相似';
      } else if (isSimilarAddress(e1.address, e2.address) && e1.address.length > 5) {
        reason = '地址高度相似';
      }

      if (reason) {
        uf.union(i, j);
        matchReasons.set(`${i}-${j}`, reason);
      }
    }
  }

  // 分组
  const groups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(i);
  }

  // 构建结果
  const clusters: ClusterResult[] = [];
  let groupId = 0;
  for (const [, indices] of groups) {
    const groupEntities = indices.map((i) => entities[i]);
    let reason = '独立实体';
    if (indices.length > 1) {
      // 找到这个组的匹配原因
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          const key1 = `${indices[i]}-${indices[j]}`;
          const key2 = `${indices[j]}-${indices[i]}`;
          if (matchReasons.has(key1)) {
            reason = matchReasons.get(key1)!;
            break;
          }
          if (matchReasons.has(key2)) {
            reason = matchReasons.get(key2)!;
            break;
          }
        }
      }
    }
    clusters.push({ groupId: groupId++, entities: groupEntities, matchReason: reason });
  }

  return { clusters, matchReasons };
}
