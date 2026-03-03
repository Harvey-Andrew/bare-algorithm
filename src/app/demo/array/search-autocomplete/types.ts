'use client';

/**
 * 搜索项 - 模拟电商商品关键词
 */
export interface SearchItem {
  /** 关键词 */
  keyword: string;
  /** 搜索热度 */
  heat: number;
  /** 类目 */
  category: string;
  /** 商品数量 */
  productCount: number;
}

/**
 * 搜索建议
 */
export interface Suggestion {
  /** 关键词 */
  keyword: string;
  /** 高亮后的关键词 */
  highlightedKeyword: string;
  /** 热度 */
  heat: number;
  /** 类目 */
  category: string;
  /** 匹配类型 */
  matchType: 'prefix' | 'fuzzy';
}

/**
 * 搜索结果
 */
export interface SearchResult {
  suggestions: Suggestion[];
  totalMatches: number;
  searchTime: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  indexBuildTime: number;
  searchTime: number;
  totalKeywords: number;
  matchCount: number;
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  maxSuggestions: number;
  enableFuzzy: boolean;
  minQueryLength: number;
}
