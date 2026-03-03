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
            <strong>匹配规则</strong>：电话相同 / 姓名相同+地址相似 / 地址高度重合
          </li>
          <li>
            <strong>核心算法</strong>：并查集 (Union-Find)，时间复杂度 O(n² × α(n))
          </li>
          <li>
            <strong>应用场景</strong>：用户数据去重、CRM 客户合并、订单地址聚合
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
