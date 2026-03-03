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
          <strong className="text-white">关键路径法（CPM）</strong>
          ：找出项目中耗时最长的任务序列，决定项目的最短完成时间。
        </p>
        <p>
          <strong className="text-white">影响分析</strong>
          ：通过图遍历找出某个任务延期后会影响的所有下游任务。
        </p>
      </CardContent>
    </Card>
  );
}
