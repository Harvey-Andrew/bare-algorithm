'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS, SVG_CONFIG } from '../constants';
import type { GraphEdge, GraphNode } from '../types';

interface RelationGraphSvgProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  components: Map<string, number>;
  selectedNodes: string[];
  shortestPath: string[] | null;
  mutualFriends: string[];
  onNodeClick: (nodeId: string) => void;
}

/**
 * 关系图可视化组件
 */
export function RelationGraphSvg({
  nodes,
  edges,
  components,
  selectedNodes,
  shortestPath,
  mutualFriends,
  onNodeClick,
}: RelationGraphSvgProps) {
  const { width, height, nodeRadius } = SVG_CONFIG;

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">社交关系图</CardTitle>
        <CardDescription>不同颜色表示不同的社交圈（连通分量）</CardDescription>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-96">
          {/* 边 */}
          {edges.map((e, i) => {
            const source = nodes.find((n) => n.id === e.source);
            const target = nodes.find((n) => n.id === e.target);
            if (!source || !target) return null;

            const isOnPath =
              shortestPath &&
              shortestPath.includes(e.source) &&
              shortestPath.includes(e.target) &&
              Math.abs(shortestPath.indexOf(e.source) - shortestPath.indexOf(e.target)) === 1;

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isOnPath ? '#22c55e' : '#475569'}
                strokeWidth={isOnPath ? 3 : 2}
              />
            );
          })}

          {/* 节点 */}
          {nodes.map((n) => {
            const componentId = components.get(n.id) || 0;
            const isSelected = selectedNodes.includes(n.id);
            const isOnPath = shortestPath?.includes(n.id);
            const isMutual = mutualFriends.includes(n.id);

            let stroke = COLORS[componentId % COLORS.length];
            let strokeWidth = 3;
            if (isSelected) {
              stroke = '#3b82f6';
              strokeWidth = 4;
            } else if (isOnPath) {
              stroke = '#22c55e';
              strokeWidth = 4;
            } else if (isMutual) {
              stroke = '#a855f7';
              strokeWidth = 4;
            }

            return (
              <g key={n.id} onClick={() => onNodeClick(n.id)} className="cursor-pointer">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={nodeRadius}
                  fill="#1e293b"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {n.name}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
