'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageNode, PathResult } from '../types';

interface ResultCardProps {
  result: PathResult | null;
  pages: PageNode[];
}

/**
 * 检查结果卡片组件
 */
export function ResultCard({ result, pages }: ResultCardProps) {
  if (!result) return null;

  return (
    <Card
      className={`border ${result.reachable ? 'border-green-500/50 bg-green-950/20' : 'border-red-500/50 bg-red-950/20'}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {result.reachable ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400" /> 可以访问
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-400" /> 无法访问
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result.reachable && result.path ? (
          <div className="space-y-2">
            <p className="text-sm text-green-300">访问路径：</p>
            <div className="flex flex-wrap gap-1">
              {result.path.map((id, i) => (
                <React.Fragment key={id}>
                  <span className="px-2 py-1 bg-green-500/20 rounded text-green-300 text-sm">
                    {pages.find((p) => p.id === id)?.name}
                  </span>
                  {i < result.path!.length - 1 && <span className="text-slate-500">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-300">
              {result.blockedAt ? (
                <>
                  在 &ldquo;{pages.find((p) => p.id === result.blockedAt)?.name}&rdquo; 被拦截
                  <br />
                  需要 &ldquo;{pages.find((p) => p.id === result.blockedAt)?.requiredRole}&rdquo;
                  权限
                </>
              ) : (
                '没有可达路径'
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
