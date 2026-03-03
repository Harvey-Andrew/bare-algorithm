'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NODE_POSITIONS, SVG_CONFIG } from '../constants';
import type { CriticalPathResult, TaskEdge, TaskNode } from '../types';

interface WorkflowGraphProps {
  tasks: TaskNode[];
  edges: TaskEdge[];
  result: CriticalPathResult | null;
  selectedTask: string | null;
  affectedNodes: Set<string>;
  onTaskClick: (taskId: string) => void;
}

/**
 * 工作流程图可视化组件
 */
export function WorkflowGraph({
  tasks,
  edges,
  result,
  selectedTask,
  affectedNodes,
  onTaskClick,
}: WorkflowGraphProps) {
  const { width, height, nodeWidth, nodeHeight } = SVG_CONFIG;

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">工作流程图</CardTitle>
        <CardDescription>红色路径为关键路径，橙色为影响范围</CardDescription>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-96">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker
              id="arrow-red"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
            <marker
              id="arrow-orange"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
            </marker>
          </defs>

          {/* 边 */}
          {edges.map((e, i) => {
            const from = NODE_POSITIONS.get(e.from);
            const to = NODE_POSITIONS.get(e.to);
            if (!from || !to) return null;

            const isCritical =
              result?.criticalPath.includes(e.from) && result?.criticalPath.includes(e.to);
            const isAffected = affectedNodes.has(e.from) && affectedNodes.has(e.to);

            let stroke = '#64748b';
            let marker = 'url(#arrow)';
            if (isCritical) {
              stroke = '#ef4444';
              marker = 'url(#arrow-red)';
            } else if (isAffected) {
              stroke = '#f97316';
              marker = 'url(#arrow-orange)';
            }

            return (
              <line
                key={i}
                x1={from.x + nodeWidth / 2}
                y1={from.y}
                x2={to.x - nodeWidth / 2}
                y2={to.y}
                stroke={stroke}
                strokeWidth={isCritical ? 3 : 2}
                markerEnd={marker}
              />
            );
          })}

          {/* 节点 */}
          {tasks.map((t) => {
            const pos = NODE_POSITIONS.get(t.id);
            if (!pos) return null;

            const isCritical = result?.criticalPath.includes(t.id);
            const isAffected = affectedNodes.has(t.id);
            const isSelected = selectedTask === t.id;

            let fill = '#1e293b';
            let stroke = '#64748b';
            if (isSelected) {
              fill = '#7c2d12';
              stroke = '#f97316';
            } else if (isCritical) {
              fill = '#7f1d1d';
              stroke = '#ef4444';
            } else if (isAffected) {
              fill = '#431407';
              stroke = '#f97316';
            }

            return (
              <g key={t.id} onClick={() => onTaskClick(t.id)} className="cursor-pointer">
                <rect
                  x={pos.x - nodeWidth / 2}
                  y={pos.y - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={2}
                />
                <text
                  x={pos.x}
                  y={pos.y - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {t.name}
                </text>
                <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#94a3b8" fontSize="10">
                  {t.duration}天
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
