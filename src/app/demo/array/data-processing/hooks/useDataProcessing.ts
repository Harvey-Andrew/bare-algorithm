'use client';

import { useCallback, useMemo, useState } from 'react';

import { CONFIG, generateMockProducts } from '../constants';
import { processProducts } from '../services/dataProcessor.api';
import type { FilterConfig, PaginationConfig, Product, SortConfig } from '../types';

/**
 * 数据处理状态管理 Hook
 */
export function useDataProcessing() {
  // 原始数据（懒初始化）
  const [rawData] = useState<Product[]>(() => generateMockProducts(CONFIG.DEFAULT_DATA_COUNT));

  // 筛选配置
  const [filter, setFilter] = useState<FilterConfig>({});

  // 排序配置
  const [sort, setSort] = useState<SortConfig>({
    field: 'sales',
    order: 'desc',
  });

  // 分页配置
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: CONFIG.DEFAULT_PAGE_SIZE,
  });

  // 处理结果（使用 useMemo 避免重复计算）
  const {
    result: displayData,
    total,
    aggregates,
    groupStats,
    metrics,
    warnings,
  } = useMemo(() => {
    return processProducts(rawData, filter, sort, pagination);
  }, [rawData, filter, sort, pagination]);

  /**
   * 更新筛选条件
   */
  const updateFilter = useCallback((newFilter: Partial<FilterConfig>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
    setPagination((prev) => ({ ...prev, page: 1 })); // 重置到第一页
  }, []);

  /**
   * 更新排序
   */
  const updateSort = useCallback((field: keyof Product) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  /**
   * 更新分页
   */
  const updatePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * 更新每页数量
   */
  const updatePageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, []);

  /**
   * 清除筛选
   */
  const clearFilter = useCallback(() => {
    setFilter({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    // 数据
    rawData,
    displayData,
    total,
    aggregates,
    groupStats,
    warnings,

    // 配置
    filter,
    sort,
    pagination,
    metrics,

    // 操作
    updateFilter,
    updateSort,
    updatePage,
    updatePageSize,
    clearFilter,
  };
}

// 导出类型别名方便组件使用
export type UseDataProcessingReturn = ReturnType<typeof useDataProcessing>;
