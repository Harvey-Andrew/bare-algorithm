'use client';

import { AlertCircle, CheckCircle2, MapPin, Phone, User, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClusterResult } from '../types';

interface ClusterResultsProps {
  results: ClusterResult[] | null;
  duplicateClusters: ClusterResult[];
  uniqueEntities: ClusterResult[];
}

/**
 * 聚类结果展示组件
 */
export function ClusterResults({
  results,
  duplicateClusters,
  uniqueEntities,
}: ClusterResultsProps) {
  if (!results) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>点击&quot;开始检测&quot;查看结果</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{duplicateClusters.length}</p>
                <p className="text-xs text-muted-foreground">组重复记录</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{uniqueEntities.length}</p>
                <p className="text-xs text-muted-foreground">独立记录</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 重复组 */}
      {duplicateClusters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              发现的重复记录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {duplicateClusters.map((cluster) => (
              <div
                key={cluster.groupId}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400">
                    重复组 #{cluster.groupId + 1}
                  </span>
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                    {cluster.matchReason}
                  </span>
                </div>
                <div className="space-y-2">
                  {cluster.entities.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 text-sm bg-background/50 p-2 rounded"
                    >
                      <span className="text-muted-foreground text-xs w-6">#{e.id}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {e.name}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Phone className="h-3 w-3" />
                        {e.phone}
                      </span>
                      <span className="flex items-center gap-1 text-xs truncate">
                        <MapPin className="h-3 w-3" />
                        {e.address}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 独立记录 */}
      {uniqueEntities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              独立记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uniqueEntities.map((cluster) => (
                <div
                  key={cluster.groupId}
                  className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-sm"
                >
                  #{cluster.entities[0].id} {cluster.entities[0].name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
