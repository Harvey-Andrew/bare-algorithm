'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SVG_CONFIG } from '../constants';
import { calculateNodePositions } from '../services/dependency.api';
import type { AnalysisResult, Dependency, Module, NodePosition } from '../types';

interface DependencyGraphProps {
  modules: Module[];
  deps: Dependency[];
  result: AnalysisResult | null;
}

/**
 * 依赖关系图可视化组件
 */
export function DependencyGraph({ modules, deps, result }: DependencyGraphProps) {
  const { width: svgWidth, height: svgHeight, nodeRadius } = SVG_CONFIG;

  // 计算节点位置
  const positions: Map<string, NodePosition> = useMemo(
    () => calculateNodePositions(modules, deps, svgWidth, svgHeight),
    [modules, deps, svgWidth, svgHeight]
  );

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">依赖关系图</CardTitle>
        <CardDescription>箭头表示依赖方向（A → B 表示 A 依赖 B）</CardDescription>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-96">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker
              id="arrowhead-red"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>

          {/* 边 */}
          {deps.map((d, i) => {
            const from = positions.get(d.from);
            const to = positions.get(d.to);
            if (!from || !to) return null;

            const isCycleEdge =
              result?.hasCycle && result.cycleNodes.has(d.from) && result.cycleNodes.has(d.to);

            // 计算边的起点和终点（考虑节点半径）
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offsetX = (dx / dist) * nodeRadius;
            const offsetY = (dy / dist) * nodeRadius;

            return (
              <line
                key={i}
                x1={from.x + offsetX}
                y1={from.y + offsetY}
                x2={to.x - offsetX}
                y2={to.y - offsetY}
                stroke={isCycleEdge ? '#ef4444' : '#64748b'}
                strokeWidth={2}
                markerEnd={isCycleEdge ? 'url(#arrowhead-red)' : 'url(#arrowhead)'}
              />
            );
          })}

          {/* 节点 */}
          {modules.map((m) => {
            const pos = positions.get(m.id);
            if (!pos) return null;

            const isCycleNode = result?.hasCycle && result.cycleNodes.has(m.id);
            const orderIndex = result?.order?.indexOf(m.id);

            return (
              <g key={m.id} className="cursor-pointer" style={{ cursor: 'pointer' }}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={isCycleNode ? '#7f1d1d' : '#1e293b'}
                  stroke={isCycleNode ? '#ef4444' : '#8b5cf6'}
                  strokeWidth={3}
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {m.name}
                </text>
                {orderIndex !== undefined && orderIndex >= 0 && (
                  <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#22c55e" fontSize="10">
                    #{orderIndex + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
