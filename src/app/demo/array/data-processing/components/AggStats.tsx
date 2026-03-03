'use client';

import { AlertTriangle, Package, ShoppingCart, TrendingUp, Warehouse } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AggregateResult } from '../types';

interface AggStatsProps {
  aggregates: AggregateResult;
  warnings: string[];
}

/**
 * 聚合统计卡片组件
 */
export function AggStats({ aggregates, warnings }: AggStatsProps) {
  const formatPrice = (cents: number) => `¥${(cents / 100).toFixed(2)}`;
  const formatNumber = (n: number) => n.toLocaleString();

  const stats = [
    {
      label: '商品总数',
      value: formatNumber(aggregates.totalProducts),
      icon: Package,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      label: '上架中',
      value: formatNumber(aggregates.activeProducts),
      icon: ShoppingCart,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      label: '总销量',
      value: formatNumber(aggregates.totalSales),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      label: '总库存',
      value: formatNumber(aggregates.totalStock),
      icon: Warehouse,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
  ];

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">数据概览</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`p-1.5 rounded ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 平均价格 */}
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">平均价格</span>
            <span className="text-white font-bold">{formatPrice(aggregates.avgPrice)}</span>
          </div>
        </div>

        {/* 数据质量警告 */}
        {(aggregates.duplicateSkuCount > 0 ||
          aggregates.missingFieldCount > 0 ||
          warnings.length > 0) && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">数据质量警告</span>
            </div>
            <ul className="text-xs text-yellow-300/80 space-y-1">
              {aggregates.duplicateSkuCount > 0 && (
                <li>• 发现 {aggregates.duplicateSkuCount} 条重复 SKU</li>
              )}
              {warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
