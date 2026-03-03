'use client';

import React from 'react';
import { Navigation, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GraphNode } from '../types';

interface ResultCardsProps {
  nodes: GraphNode[];
  selectedNodes: string[];
  shortestPath: string[] | null;
  mutualFriends: string[];
}

/**
 * 结果卡片组件
 */
export function ResultCards({
  nodes,
  selectedNodes,
  shortestPath,
  mutualFriends,
}: ResultCardsProps) {
  return (
    <div className="space-y-4">
      {shortestPath && (
        <Card className="border-green-500/50 bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Navigation className="w-5 h-5 text-green-400" /> 最短路径
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {shortestPath.map((id, i) => (
                <React.Fragment key={id}>
                  <span className="px-2 py-1 bg-green-500/20 rounded text-green-300 text-sm">
                    {nodes.find((n) => n.id === id)?.name}
                  </span>
                  {i < shortestPath.length - 1 && <span className="text-slate-500">—</span>}
                </React.Fragment>
              ))}
            </div>
            <p className="text-sm text-slate-400">距离：{shortestPath.length - 1} 度</p>
          </CardContent>
        </Card>
      )}

      {mutualFriends.length > 0 && (
        <Card className="border-purple-500/50 bg-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-purple-400" /> 共同好友
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mutualFriends.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-sm"
                >
                  {nodes.find((n) => n.id === id)?.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {shortestPath === null && selectedNodes.length === 2 && (
        <Card className="border-red-500/50 bg-red-950/20">
          <CardContent className="py-4">
            <p className="text-red-300 text-sm">这两人不在同一社交圈，无法连通</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
