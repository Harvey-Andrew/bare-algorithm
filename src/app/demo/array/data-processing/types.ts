'use client';

/**
 * 商品数据结构 - 模拟电商后台商品管理
 */
export interface Product {
  /** 商品唯一标识 */
  id: string;
  /** SKU 编码 */
  sku: string;
  /** 商品名称 */
  name: string;
  /** 类目 */
  category: string;
  /** 价格（分） */
  price: number;
  /** 库存 */
  stock: number;
  /** 销量 */
  sales: number;
  /** 上架时间 */
  createdAt: number;
  /** 状态 */
  status: 'active' | 'inactive' | 'deleted';
  /** 标签（可选） */
  tags?: string[];
}

/**
 * 排序配置
 */
export interface SortConfig {
  field: keyof Product;
  order: 'asc' | 'desc';
}

/**
 * 筛选配置
 */
export interface FilterConfig {
  category?: string;
  status?: Product['status'];
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
}

/**
 * 分组统计结果
 */
export interface GroupStats {
  category: string;
  count: number;
  totalSales: number;
  totalStock: number;
  avgPrice: number;
}

/**
 * 聚合统计结果
 */
export interface AggregateResult {
  totalProducts: number;
  activeProducts: number;
  totalSales: number;
  totalStock: number;
  avgPrice: number;
  duplicateSkuCount: number;
  missingFieldCount: number;
}

/**
 * 处理结果
 */
export interface ProcessingResult {
  data: Product[];
  total: number;
  aggregates: AggregateResult;
  groupStats: GroupStats[];
  processingTime: number;
  warnings: string[];
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  sortTime: number;
  filterTime: number;
  groupTime: number;
  totalTime: number;
  recordCount: number;
}
