import type {
  AggregateResult,
  FilterConfig,
  GroupStats,
  PaginationConfig,
  PerformanceMetrics,
  Product,
  SortConfig,
} from '../types';

/**
 * 快速排序 - 支持多字段排序
 * 时间复杂度: O(n log n)
 */
export function sortProducts(products: Product[], sortConfig: SortConfig): Product[] {
  const { field, order } = sortConfig;
  const sorted = [...products];

  sorted.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    // 处理 undefined / null
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return order === 'asc' ? -1 : 1;
    if (bVal == null) return order === 'asc' ? 1 : -1;

    // 比较
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  return sorted;
}

/**
 * 筛选商品
 * 时间复杂度: O(n)
 */
export function filterProducts(products: Product[], filter: FilterConfig): Product[] {
  return products.filter((product) => {
    // 类目筛选
    if (filter.category && product.category !== filter.category) {
      return false;
    }

    // 状态筛选
    if (filter.status && product.status !== filter.status) {
      return false;
    }

    // 价格区间
    if (filter.minPrice !== undefined && product.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== undefined && product.price > filter.maxPrice) {
      return false;
    }

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      const matchName = product.name.toLowerCase().includes(keyword);
      const matchSku = product.sku.toLowerCase().includes(keyword);
      if (!matchName && !matchSku) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 分页切片
 * 时间复杂度: O(1)
 */
export function paginateProducts(products: Product[], pagination: PaginationConfig): Product[] {
  const { page, pageSize } = pagination;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return products.slice(start, end);
}

/**
 * 按类目分组统计
 * 时间复杂度: O(n)
 */
export function groupByCategory(products: Product[]): GroupStats[] {
  const groupMap = new Map<string, GroupStats>();

  for (const product of products) {
    if (!groupMap.has(product.category)) {
      groupMap.set(product.category, {
        category: product.category,
        count: 0,
        totalSales: 0,
        totalStock: 0,
        avgPrice: 0,
      });
    }

    const group = groupMap.get(product.category)!;
    group.count += 1;
    group.totalSales += Math.max(0, product.sales);
    group.totalStock += Math.max(0, product.stock);
  }

  // 计算平均价格
  const groups = Array.from(groupMap.values());
  for (const group of groups) {
    const categoryProducts = products.filter((p) => p.category === group.category);
    const validPrices = categoryProducts.map((p) => p.price).filter((p) => p > 0);
    group.avgPrice =
      validPrices.length > 0
        ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
        : 0;
  }

  return groups.sort((a, b) => b.totalSales - a.totalSales);
}

/**
 * 哈希去重 - 检测重复 SKU
 * 时间复杂度: O(n)
 */
export function findDuplicateSkus(products: Product[]): {
  duplicates: Map<string, Product[]>;
  count: number;
} {
  const skuMap = new Map<string, Product[]>();

  for (const product of products) {
    if (!skuMap.has(product.sku)) {
      skuMap.set(product.sku, []);
    }
    skuMap.get(product.sku)!.push(product);
  }

  const duplicates = new Map<string, Product[]>();
  let count = 0;

  for (const [sku, products] of skuMap) {
    if (products.length > 1) {
      duplicates.set(sku, products);
      count += products.length - 1;
    }
  }

  return { duplicates, count };
}

/**
 * 数据质量检查 - 检测缺失字段、异常值
 */
export function checkDataQuality(products: Product[]): {
  missingFieldCount: number;
  abnormalPriceCount: number;
  abnormalStockCount: number;
  warnings: string[];
} {
  let missingFieldCount = 0;
  let abnormalPriceCount = 0;
  let abnormalStockCount = 0;
  const warnings: string[] = [];

  for (const product of products) {
    // 检查缺失标签
    if (!product.tags) {
      missingFieldCount += 1;
    }

    // 检查异常价格
    if (product.price <= 0) {
      abnormalPriceCount += 1;
    }

    // 检查异常库存
    if (product.stock < 0) {
      abnormalStockCount += 1;
    }
  }

  if (missingFieldCount > 0) {
    warnings.push(`发现 ${missingFieldCount} 条记录缺失 tags 字段`);
  }
  if (abnormalPriceCount > 0) {
    warnings.push(`发现 ${abnormalPriceCount} 条记录价格异常（≤0）`);
  }
  if (abnormalStockCount > 0) {
    warnings.push(`发现 ${abnormalStockCount} 条记录库存异常（<0）`);
  }

  return { missingFieldCount, abnormalPriceCount, abnormalStockCount, warnings };
}

/**
 * 综合聚合统计
 */
export function aggregateProducts(products: Product[]): AggregateResult {
  const { count: duplicateSkuCount } = findDuplicateSkus(products);
  const { missingFieldCount } = checkDataQuality(products);

  const activeProducts = products.filter((p) => p.status === 'active');
  const validProducts = products.filter((p) => p.price > 0);

  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    totalSales: products.reduce((sum, p) => sum + Math.max(0, p.sales), 0),
    totalStock: products.reduce((sum, p) => sum + Math.max(0, p.stock), 0),
    avgPrice:
      validProducts.length > 0
        ? Math.round(validProducts.reduce((sum, p) => sum + p.price, 0) / validProducts.length)
        : 0,
    duplicateSkuCount,
    missingFieldCount,
  };
}

/**
 * 综合处理流水线
 */
export function processProducts(
  products: Product[],
  filter: FilterConfig,
  sort: SortConfig,
  pagination: PaginationConfig
): {
  result: Product[];
  total: number;
  aggregates: AggregateResult;
  groupStats: GroupStats[];
  metrics: PerformanceMetrics;
  warnings: string[];
} {
  const startTime = performance.now();

  // 1. 筛选
  const filterStart = performance.now();
  const filtered = filterProducts(products, filter);
  const filterTime = performance.now() - filterStart;

  // 2. 排序
  const sortStart = performance.now();
  const sorted = sortProducts(filtered, sort);
  const sortTime = performance.now() - sortStart;

  // 3. 分组统计
  const groupStart = performance.now();
  const groupStats = groupByCategory(filtered);
  const groupTime = performance.now() - groupStart;

  // 4. 分页
  const paginated = paginateProducts(sorted, pagination);

  // 5. 聚合统计
  const aggregates = aggregateProducts(filtered);

  // 6. 数据质量检查
  const { warnings } = checkDataQuality(products);

  const totalTime = performance.now() - startTime;

  return {
    result: paginated,
    total: filtered.length,
    aggregates,
    groupStats,
    metrics: {
      sortTime,
      filterTime,
      groupTime,
      totalTime,
      recordCount: products.length,
    },
    warnings,
  };
}
