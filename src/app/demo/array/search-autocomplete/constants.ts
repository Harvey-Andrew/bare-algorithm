import type { SearchConfig, SearchItem } from './types';

/**
 * 商品关键词前缀
 */
const KEYWORD_PREFIXES = [
  '苹果',
  '华为',
  '小米',
  '三星',
  '联想',
  'iPhone',
  'MacBook',
  'iPad',
  '手机',
  '电脑',
  '笔记本',
  '平板',
  '耳机',
  '手表',
  '充电器',
  '数据线',
  '衣服',
  '裤子',
  '鞋子',
  '包包',
  '帽子',
  '围巾',
  '手套',
  '袜子',
  '零食',
  '饮料',
  '水果',
  '蔬菜',
  '肉类',
  '海鲜',
  '调料',
  '速食',
];

/**
 * 关键词后缀
 */
const KEYWORD_SUFFIXES = [
  '',
  '新款',
  '正品',
  '官方',
  '旗舰店',
  '促销',
  '特价',
  '包邮',
  '男款',
  '女款',
  '儿童',
  '学生',
  '商务',
  '运动',
  '休闲',
  '时尚',
];

/**
 * 类目列表
 */
const CATEGORIES = ['手机数码', '电脑办公', '服饰鞋包', '食品饮料', '家具家装'];

/**
 * 生成模拟搜索关键词
 * 注意：组合数有限（32 × 16 = 512），不要设置过大的 count
 */
export function generateMockKeywords(count: number = 500): SearchItem[] {
  const keywords: SearchItem[] = [];
  const seenKeywords = new Set<string>();

  // 先生成所有可能的组合
  for (const prefix of KEYWORD_PREFIXES) {
    for (const suffix of KEYWORD_SUFFIXES) {
      const keyword = `${prefix}${suffix}`.trim();
      if (!seenKeywords.has(keyword)) {
        seenKeywords.add(keyword);
        keywords.push({
          keyword,
          heat: Math.floor(Math.random() * 100000),
          category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
          productCount: Math.floor(Math.random() * 10000) + 10,
        });
      }
      if (keywords.length >= count) break;
    }
    if (keywords.length >= count) break;
  }

  return keywords;
}

/**
 * 热门搜索词
 */
export const HOT_KEYWORDS = [
  'iPhone 15',
  'MacBook Pro',
  '华为 Mate 60',
  '小米 14',
  '联想电脑',
  '运动鞋',
  '羽绒服',
  '零食大礼包',
  '蓝牙耳机',
  '充电宝',
];

/**
 * 默认搜索配置
 */
export const DEFAULT_CONFIG: SearchConfig = {
  maxSuggestions: 10,
  enableFuzzy: true,
  minQueryLength: 1,
};

/**
 * 性能配置
 */
export const PERFORMANCE_CONFIG = {
  /** 默认关键词数量 */
  DEFAULT_KEYWORD_COUNT: 500,
  /** 防抖延迟 */
  DEBOUNCE_MS: 150,
};
