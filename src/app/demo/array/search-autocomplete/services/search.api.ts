import type { SearchConfig, SearchItem, SearchResult, Suggestion } from '../types';

/**
 * 构建前缀索引（哈希表）
 * 时间复杂度: O(n * L)，L 为平均关键词长度
 */
export function buildPrefixIndex(items: SearchItem[]): {
  index: Map<string, SearchItem[]>;
  buildTime: number;
} {
  const start = performance.now();
  const index = new Map<string, SearchItem[]>();

  for (const item of items) {
    const keyword = item.keyword.toLowerCase();
    // 为每个前缀建立索引
    for (let i = 1; i <= Math.min(keyword.length, 5); i++) {
      const prefix = keyword.slice(0, i);
      if (!index.has(prefix)) {
        index.set(prefix, []);
      }
      index.get(prefix)!.push(item);
    }
  }

  const buildTime = performance.now() - start;
  return { index, buildTime };
}

/**
 * 前缀匹配搜索
 * 时间复杂度: O(1) 查找 + O(k log k) 排序，k 为匹配数
 */
export function searchByPrefix(
  index: Map<string, SearchItem[]>,
  query: string,
  config: SearchConfig
): SearchResult {
  const start = performance.now();

  if (query.length < config.minQueryLength) {
    return { suggestions: [], totalMatches: 0, searchTime: 0 };
  }

  const normalizedQuery = query.toLowerCase();
  const prefix = normalizedQuery.slice(0, 5); // 使用前 5 个字符查找

  // O(1) 哈希查找
  const candidates = index.get(prefix) || [];

  // 过滤精确前缀匹配
  const matched = candidates.filter((item) =>
    item.keyword.toLowerCase().startsWith(normalizedQuery)
  );

  // 按热度排序取 Top-K
  const sorted = matched.sort((a, b) => b.heat - a.heat);
  const topK = sorted.slice(0, config.maxSuggestions);

  const suggestions: Suggestion[] = topK.map((item) => ({
    keyword: item.keyword,
    highlightedKeyword: highlightMatch(item.keyword, query),
    heat: item.heat,
    category: item.category,
    matchType: 'prefix',
  }));

  const searchTime = performance.now() - start;

  return {
    suggestions,
    totalMatches: matched.length,
    searchTime,
  };
}

/**
 * 模糊搜索（包含匹配）
 * 时间复杂度: O(n)
 */
export function searchFuzzy(
  items: SearchItem[],
  query: string,
  config: SearchConfig
): SearchResult {
  const start = performance.now();

  if (query.length < config.minQueryLength) {
    return { suggestions: [], totalMatches: 0, searchTime: 0 };
  }

  const normalizedQuery = query.toLowerCase();

  // O(n) 遍历
  const matched = items.filter((item) => item.keyword.toLowerCase().includes(normalizedQuery));

  // 按热度排序取 Top-K
  const sorted = matched.sort((a, b) => b.heat - a.heat);
  const topK = sorted.slice(0, config.maxSuggestions);

  const suggestions: Suggestion[] = topK.map((item) => ({
    keyword: item.keyword,
    highlightedKeyword: highlightMatch(item.keyword, query),
    heat: item.heat,
    category: item.category,
    matchType: 'fuzzy',
  }));

  const searchTime = performance.now() - start;

  return {
    suggestions,
    totalMatches: matched.length,
    searchTime,
  };
}

/**
 * 综合搜索（前缀优先，模糊补充）
 */
export function search(
  index: Map<string, SearchItem[]>,
  items: SearchItem[],
  query: string,
  config: SearchConfig
): SearchResult {
  const start = performance.now();

  // 先进行前缀搜索
  const prefixResult = searchByPrefix(index, query, config);

  // 如果结果不足且开启模糊搜索，补充模糊结果
  if (prefixResult.suggestions.length < config.maxSuggestions && config.enableFuzzy) {
    const fuzzyResult = searchFuzzy(items, query, {
      ...config,
      maxSuggestions: config.maxSuggestions - prefixResult.suggestions.length,
    });

    // 合并去重
    const prefixKeywords = new Set(prefixResult.suggestions.map((s) => s.keyword));
    const uniqueFuzzy = fuzzyResult.suggestions.filter((s) => !prefixKeywords.has(s.keyword));

    return {
      suggestions: [...prefixResult.suggestions, ...uniqueFuzzy],
      totalMatches: prefixResult.totalMatches + fuzzyResult.totalMatches,
      searchTime: performance.now() - start,
    };
  }

  return prefixResult;
}

/**
 * 转义 HTML 特殊字符，防止 XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 高亮匹配文本（先转义 HTML，再插入 mark 标签）
 */
export function highlightMatch(text: string, query: string): string {
  const safeText = escapeHtml(text);
  const safeQuery = escapeHtml(query);
  const regex = new RegExp(`(${escapeRegex(safeQuery)})`, 'gi');
  return safeText.replace(regex, '<mark>$1</mark>');
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 格式化热度
 */
export function formatHeat(heat: number): string {
  if (heat >= 10000) return `${(heat / 10000).toFixed(1)}万`;
  if (heat >= 1000) return `${(heat / 1000).toFixed(1)}千`;
  return heat.toString();
}
