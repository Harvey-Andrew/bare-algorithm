'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 算法说明组件
 */
export function AlgorithmInfo() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">算法说明</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <strong>检测方法</strong>：BFS 广度优先搜索，遍历所有连通分量
          </li>
          <li>
            <strong>网络分区</strong>：当连通分量数 &gt; 1 时，表示网络发生分区
          </li>
          <li>
            <strong>应用场景</strong>：分布式系统监控、微服务健康检查、集群故障检测
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
