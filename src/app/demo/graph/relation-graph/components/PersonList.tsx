'use client';

import { RefreshCw, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '../constants';
import type { GraphNode } from '../types';

interface PersonListProps {
  nodes: GraphNode[];
  components: Map<string, number>;
  selectedNodes: string[];
  shortestPath: string[] | null;
  onNodeClick: (nodeId: string) => void;
  onFindPath: () => void;
  onReset: () => void;
}

/**
 * 人物列表组件
 */
export function PersonList({
  nodes,
  components,
  selectedNodes,
  shortestPath,
  onNodeClick,
  onFindPath,
  onReset,
}: PersonListProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> 人物列表
          </CardTitle>
          <CardDescription>点击选择两个人物查询关系</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodes.map((n) => {
            const componentId = components.get(n.id) || 0;
            const isSelected = selectedNodes.includes(n.id);
            const isOnPath = shortestPath?.includes(n.id);

            return (
              <div
                key={n.id}
                onClick={() => onNodeClick(n.id)}
                className={`p-3 rounded cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : isOnPath
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[componentId % COLORS.length] }}
                />
                <span>{n.name}</span>
                {isSelected && (
                  <span className="ml-auto text-xs bg-blue-500/30 px-2 py-1 rounded">
                    #{selectedNodes.indexOf(n.id) + 1}
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button
          className="flex-1 cursor-pointer"
          onClick={onFindPath}
          disabled={selectedNodes.length !== 2}
        >
          <Search className="w-4 h-4 mr-2" />
          查找路径
        </Button>
        <Button variant="outline" onClick={onReset} className="cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
