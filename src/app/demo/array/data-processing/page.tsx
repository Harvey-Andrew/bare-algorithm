'use client';

import { Database, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AggStats } from './components/AggStats';
import { CategoryChart } from './components/CategoryChart';
import { DataTable } from './components/DataTable';
import { FilterPanel } from './components/FilterPanel';
import { Pagination } from './components/Pagination';
import { PerformancePanel } from './components/PerformancePanel';
import { useDataProcessing } from './hooks/useDataProcessing';

/**
 * 列表/表格数据处理 Demo 页面
 * 电商后台商品管理场景 - 排序/筛选/分页/去重/聚合统计
 */
export default function DataProcessingDemo() {
  const {
    displayData,
    total,
    aggregates,
    groupStats,
    warnings,
    filter,
    sort,
    pagination,
    metrics,
    updateFilter,
    updateSort,
    updatePage,
    updatePageSize,
    clearFilter,
  } = useDataProcessing();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Database className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">电商商品管理</h1>
                  <p className="text-sm text-slate-400">
                    排序 O(n log n) · 筛选 O(n) · 哈希去重 O(n)
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成数据
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧面板 */}
          <div className="space-y-6">
            <FilterPanel filter={filter} onFilterChange={updateFilter} onClear={clearFilter} />
            <AggStats aggregates={aggregates} warnings={warnings} />
            <PerformancePanel metrics={metrics} />
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 类目分布图 */}
            <CategoryChart groupStats={groupStats} />

            {/* 数据表格 */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">商品列表</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable data={displayData} sort={sort} onSort={updateSort} />
                <Pagination
                  total={total}
                  pagination={pagination}
                  onPageChange={updatePage}
                  onPageSizeChange={updatePageSize}
                />
              </CardContent>
            </Card>

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📊 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">电商后台商品管理</strong> -
                  运营人员需要快速查找、筛选、排序商品数据
                </p>
                <p>
                  <strong className="text-emerald-400">数据规模</strong>: 10,000+
                  商品，包含脏数据（重复 SKU、缺失字段、异常值）
                </p>
                <p>
                  <strong className="text-cyan-400">核心算法</strong>: 快速排序、哈希去重、分组聚合
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
