/**
 * LRU 缓存 Demo 类型定义
 */

// 缓存条目
export interface CacheEntry {
  key: string;
  value: string;
  accessTime: number;
}

// 缓存操作日志
export interface OperationLog {
  type: 'get' | 'put' | 'evict';
  key: string;
  value?: string;
  hit?: boolean;
  timestamp: number;
}

// 缓存统计
export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}
