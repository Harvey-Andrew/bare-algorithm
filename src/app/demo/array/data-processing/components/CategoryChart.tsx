'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GroupStats } from '../types';

interface CategoryChartProps {
  groupStats: GroupStats[];
}

/**
 * 类目分组统计图表
 */
export function CategoryChart({ groupStats }: CategoryChartProps) {
  const maxSales = Math.max(...groupStats.map((g) => g.totalSales), 1);
  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-lg">类目销量分布</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groupStats.slice(0, 8).map((group) => {
            const widthPercent = (group.totalSales / maxSales) * 100;
            return (
              <div key={group.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{group.category}</span>
                  <span className="text-slate-400">
                    {group.count} 件 · 销量 {formatNumber(group.totalSales)}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {groupStats.length === 0 && <div className="text-center py-4 text-slate-500">暂无数据</div>}
      </CardContent>
    </Card>
  );
}
