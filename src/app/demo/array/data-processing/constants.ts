import type { Product } from './types';

/**
 * 商品类目列表
 */
export const CATEGORIES = [
  '手机数码',
  '电脑办公',
  '家用电器',
  '服饰鞋包',
  '美妆护肤',
  '食品生鲜',
  '家居家装',
  '运动户外',
];

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' },
  { value: 'deleted', label: '已删除' },
] as const;

/**
 * 默认分页大小选项
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 生成模拟商品数据
 * 包含脏数据：缺失字段、重复 SKU、异常值
 */
export function generateMockProducts(count: number = 10000): Product[] {
  const products: Product[] = [];
  const usedSkus = new Set<string>();

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isAbnormal = Math.random() < 0.05; // 5% 异常数据

    // 生成 SKU，约 3% 重复
    let sku: string;
    if (Math.random() < 0.03 && usedSkus.size > 0) {
      // 重复 SKU
      const skuArray = Array.from(usedSkus);
      sku = skuArray[Math.floor(Math.random() * skuArray.length)];
    } else {
      sku = `SKU${String(i + 1).padStart(8, '0')}`;
      usedSkus.add(sku);
    }

    // 生成价格，包含异常值（负数、0）
    let price: number;
    if (isAbnormal && Math.random() < 0.3) {
      price = Math.random() < 0.5 ? -Math.floor(Math.random() * 1000) : 0;
    } else {
      price = Math.floor(Math.random() * 1000000) + 100; // 1 分 - 1 万元
    }

    // 生成库存，包含异常值（负数）
    let stock: number;
    if (isAbnormal && Math.random() < 0.2) {
      stock = -Math.floor(Math.random() * 100);
    } else {
      stock = Math.floor(Math.random() * 1000);
    }

    const product: Product = {
      id: `PROD${String(i + 1).padStart(8, '0')}`,
      sku,
      name: `${category}商品${i + 1}`,
      category,
      price,
      stock,
      sales: Math.floor(Math.random() * 10000),
      createdAt: Date.now() - Math.floor(Math.random() * 365 * 24 * 3600 * 1000),
      status: Math.random() < 0.8 ? 'active' : Math.random() < 0.5 ? 'inactive' : 'deleted',
    };

    // 随机添加标签（部分商品缺失）
    if (Math.random() > 0.1) {
      product.tags = ['热销', '新品', '促销'].filter(() => Math.random() > 0.6);
    }

    products.push(product);
  }

  // 乱序
  return products.sort(() => Math.random() - 0.5);
}

/**
 * 默认配置
 */
export const CONFIG = {
  /** 默认数据量 */
  DEFAULT_DATA_COUNT: 10000,
  /** 分页默认大小 */
  DEFAULT_PAGE_SIZE: 20,
  /** 性能警告阈值（ms） */
  WARN_THRESHOLD: 16,
  /** 长任务阈值（ms） */
  LONG_TASK_THRESHOLD: 50,
};
