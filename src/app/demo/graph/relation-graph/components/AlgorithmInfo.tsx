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
          <strong className="text-white">连通分量</strong>
          ：使用并查集将图中相互连通的节点分组，不同颜色代表不同的社交圈。
        </p>
        <p>
          <strong className="text-white">最短路径</strong>：BFS
          广度优先搜索找出两点间的最短连接路径。
        </p>
        <p>
          <strong className="text-white">力导向布局</strong>
          ：节点间有斥力，边有引力，模拟物理系统达到平衡布局。
        </p>
      </CardContent>
    </Card>
  );
}
