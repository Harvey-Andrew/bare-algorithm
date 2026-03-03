/**
 * LRU 缓存核心算法
 * 使用 Map 实现（Map 保持插入顺序）
 */

import type { CacheEntry, CacheStats, OperationLog } from '../types';

export class LRUCache {
  private capacity: number;
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;
  private logs: OperationLog[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, evictions: 0, hitRate: 0 };
    this.logs = [];
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (entry) {
      // 命中：删除后重新插入以更新顺序
      this.cache.delete(key);
      entry.accessTime = Date.now();
      this.cache.set(key, entry);
      this.stats.hits++;
      this.updateHitRate();
      this.logs.push({ type: 'get', key, hit: true, timestamp: Date.now() });
      return entry;
    }
    this.stats.misses++;
    this.updateHitRate();
    this.logs.push({ type: 'get', key, hit: false, timestamp: Date.now() });
    return null;
  }

  put(key: string, value: string): string | null {
    let evictedKey: string | null = null;

    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 淘汰最久未使用的（Map 第一个元素）
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
        evictedKey = firstKey;
        this.stats.evictions++;
        this.logs.push({ type: 'evict', key: firstKey, timestamp: Date.now() });
      }
    }

    const entry: CacheEntry = { key, value, accessTime: Date.now() };
    this.cache.set(key, entry);
    this.logs.push({ type: 'put', key, value, timestamp: Date.now() });

    return evictedKey;
  }

  getAll(): CacheEntry[] {
    return Array.from(this.cache.values()).reverse(); // 最新的在前
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getLogs(): OperationLog[] {
    return [...this.logs];
  }

  getCapacity(): number {
    return this.capacity;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, hitRate: 0 };
    this.logs = [];
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * 模拟 API 请求
 */
export function simulateApiRequest(
  key: string,
  mockData: Record<string, string>
): Promise<string | null> {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(mockData[key] || null);
      },
      100 + Math.random() * 200
    );
  });
}
