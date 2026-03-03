'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult, Module } from '../types';

interface AnalysisResultCardProps {
  result: AnalysisResult;
  modules: Module[];
}

/**
 * 分析结果展示组件
 */
export function AnalysisResultCard({ result, modules }: AnalysisResultCardProps) {
  return (
    <Card
      className={`border ${result.hasCycle ? 'border-red-500/50 bg-red-950/20' : 'border-green-500/50 bg-green-950/20'}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {result.hasCycle ? (
            <>
              <XCircle className="w-5 h-5 text-red-400" /> 检测到循环依赖！
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" /> 无循环依赖
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result.hasCycle ? (
          <div className="space-y-2">
            <p className="text-sm text-red-300">以下模块形成循环依赖：</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(result.cycleNodes).map((id) => (
                <span key={id} className="px-2 py-1 bg-red-500/20 rounded text-red-300 text-sm">
                  {modules.find((m) => m.id === id)?.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-green-300">构建顺序（拓扑排序）：</p>
            <div className="flex flex-wrap gap-2">
              {result.order?.map((id, i) => (
                <span key={id} className="px-2 py-1 bg-green-500/20 rounded text-green-300 text-sm">
                  {i + 1}. {modules.find((m) => m.id === id)?.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
