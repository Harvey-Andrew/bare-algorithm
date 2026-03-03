'use client';

import { AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 算法说明组件
 */
export function AlgorithmInfo() {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> 算法说明
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-400 space-y-2">
        <p>
          <strong className="text-white">拓扑排序</strong>
          ：对有向无环图（DAG）的顶点进行排序，使得对于每条边 (u, v)，u 在 v 之前。
        </p>
        <p>
          <strong className="text-white">Kahn 算法</strong>：不断选取入度为 0
          的节点，加入结果序列，并删除其出边。
        </p>
        <p>
          <strong className="text-white">环检测</strong>
          ：如果最终结果序列长度小于节点数，说明存在循环依赖。
        </p>
      </CardContent>
    </Card>
  );
}
