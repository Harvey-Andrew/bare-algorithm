'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NODE_POSITIONS, PAGE_LINKS, SVG_CONFIG } from '../constants';
import type { PageNode, PathResult } from '../types';

interface PermissionGraphProps {
  pages: PageNode[];
  targetPage: string;
  result: PathResult | null;
  reachablePages: Set<string>;
}

/**
 * 权限图可视化组件
 */
export function PermissionGraph({
  pages,
  targetPage,
  result,
  reachablePages,
}: PermissionGraphProps) {
  const { width, height, nodeRadius } = SVG_CONFIG;

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">页面权限图</CardTitle>
        <CardDescription>绿色可访问，红色无权限，蓝色为目标</CardDescription>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-96">
          <defs>
            <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker
              id="arr-green"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
            </marker>
          </defs>

          {/* 边 */}
          {PAGE_LINKS.map((l, i) => {
            const from = NODE_POSITIONS.get(l.from);
            const to = NODE_POSITIONS.get(l.to);
            if (!from || !to) return null;

            const isOnPath = result?.path?.includes(l.from) && result?.path?.includes(l.to);

            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ox = (dx / dist) * nodeRadius;
            const oy = (dy / dist) * nodeRadius;

            return (
              <line
                key={i}
                x1={from.x + ox}
                y1={from.y + oy}
                x2={to.x - ox}
                y2={to.y - oy}
                stroke={isOnPath ? '#22c55e' : '#64748b'}
                strokeWidth={isOnPath ? 3 : 2}
                markerEnd={isOnPath ? 'url(#arr-green)' : 'url(#arr)'}
              />
            );
          })}

          {/* 节点 */}
          {pages.map((p) => {
            const pos = NODE_POSITIONS.get(p.id);
            if (!pos) return null;

            const isReachable = reachablePages.has(p.id);
            const isTarget = p.id === targetPage;
            const isOnPath = result?.path?.includes(p.id);

            let fill = '#1e293b';
            let stroke = '#64748b';

            if (isTarget) {
              stroke = '#3b82f6';
              fill = '#1e3a5f';
            }
            if (isReachable) {
              fill = '#14532d';
              stroke = '#22c55e';
            }
            if (!isReachable && !isTarget) {
              fill = '#450a0a';
              stroke = '#ef4444';
            }
            if (isOnPath) {
              stroke = '#22c55e';
              fill = '#166534';
            }

            return (
              <g key={p.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={3}
                />
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {p.name}
                </text>
                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">
                  {p.requiredRole}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
