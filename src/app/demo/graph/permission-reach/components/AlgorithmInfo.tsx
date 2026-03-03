'use client';

import { AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 算法说明组件
 */
export function AlgorithmInfo() {
  return (
    <Card className="mt-6 bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> 算法说明
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-400 space-y-2">
        <p>
          <strong className="text-white">BFS 可达性</strong>
          ：从起点出发，通过广度优先搜索遍历所有可达的页面节点。
        </p>
        <p>
          <strong className="text-white">权限过滤</strong>
          ：在遍历过程中检查每个节点的权限要求，无权限则停止该方向的探索。
        </p>
      </CardContent>
    </Card>
  );
}
