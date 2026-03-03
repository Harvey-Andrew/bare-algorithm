'use client';

import { AlertTriangle, CheckCircle2, Network, Server, Wifi, WifiOff } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComponentResult } from '../types';

interface ResultsDisplayProps {
  results: ComponentResult[] | null;
  partitionCount: number;
  unhealthyCount: number;
}

/**
 * 结果展示组件
 */
export function ResultsDisplay({ results, partitionCount, unhealthyCount }: ResultsDisplayProps) {
  if (!results) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>点击&quot;检测连通性&quot;查看结果</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={
            partitionCount > 1
              ? 'border-yellow-500/30 bg-yellow-500/5'
              : 'border-green-500/30 bg-green-500/5'
          }
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              {partitionCount > 1 ? (
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              )}
              <div>
                <p
                  className={`text-2xl font-bold ${partitionCount > 1 ? 'text-yellow-400' : 'text-green-400'}`}
                >
                  {partitionCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {partitionCount > 1 ? '网络分区!' : '连通正常'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            unhealthyCount > 0
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-green-500/30 bg-green-500/5'
          }
        >
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              {unhealthyCount > 0 ? (
                <WifiOff className="h-8 w-8 text-red-400" />
              ) : (
                <Wifi className="h-8 w-8 text-green-400" />
              )}
              <div>
                <p
                  className={`text-2xl font-bold ${unhealthyCount > 0 ? 'text-red-400' : 'text-green-400'}`}
                >
                  {unhealthyCount}
                </p>
                <p className="text-xs text-muted-foreground">不健康分区</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分区详情 */}
      {results.map((component) => (
        <Card
          key={component.id}
          className={component.isHealthy ? 'border-green-500/30' : 'border-red-500/30'}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-lg flex items-center gap-2 ${component.isHealthy ? 'text-green-400' : 'text-red-400'}`}
            >
              {component.isHealthy ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              分区 #{component.id + 1}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                ({component.nodes.length} 节点)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {component.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
                    node.status === 'online'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <Server
                    className={`h-3 w-3 ${node.status === 'online' ? 'text-green-400' : 'text-red-400'}`}
                  />
                  <span className="text-sm">{node.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
