'use client';

import { Network, Plus, Server, Trash2, Wifi, WifiOff, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { NetworkEdge, NetworkNode } from '../types';

interface TopologyPanelProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  newNodeName: string;
  onNewNodeNameChange: (name: string) => void;
  onAddNode: () => void;
  onRemoveNode: (id: string) => void;
  onToggleNodeStatus: (id: string) => void;
  onRemoveEdge: (from: string, to: string) => void;
}

/**
 * 网络拓扑面板组件
 */
export function TopologyPanel({
  nodes,
  edges,
  newNodeName,
  onNewNodeNameChange,
  onAddNode,
  onRemoveNode,
  onToggleNodeStatus,
  onRemoveEdge,
}: TopologyPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          网络拓扑
        </CardTitle>
        <CardDescription>
          {nodes.length} 个节点, {edges.length} 条连接
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 节点列表 */}
        <div className="space-y-2 max-h-[300px] overflow-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                node.status === 'online'
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <Server
                className={`h-5 w-5 ${node.status === 'online' ? 'text-green-400' : 'text-red-400'}`}
              />
              <span className="flex-1 font-medium">{node.name}</span>
              <button
                onClick={() => onToggleNodeStatus(node.id)}
                className={`px-2 py-1 rounded text-xs cursor-pointer ${
                  node.status === 'online'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {node.status === 'online' ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => onRemoveNode(node.id)}
                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 添加节点 */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">添加新节点</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="节点名称"
              value={newNodeName}
              onChange={(e) => onNewNodeNameChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-background border rounded"
            />
            <Button onClick={onAddNode} size="sm" variant="outline" className="cursor-pointer">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 连接列表 */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">网络连接</p>
          <div className="flex flex-wrap gap-2">
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs group"
                >
                  <span>{fromNode?.name?.slice(0, 8) || edge.from}</span>
                  <Zap className="h-3 w-3 text-yellow-400" />
                  <span>{toNode?.name?.slice(0, 8) || edge.to}</span>
                  <button
                    onClick={() => onRemoveEdge(edge.from, edge.to)}
                    className="ml-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
