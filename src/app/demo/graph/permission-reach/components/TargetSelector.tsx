'use client';

import { RefreshCw, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageNode } from '../types';

interface TargetSelectorProps {
  pages: PageNode[];
  targetPage: string;
  onTargetChange: (pageId: string) => void;
  onCheck: () => void;
  onReset: () => void;
}

/**
 * 目标页面选择器组件
 */
export function TargetSelector({
  pages,
  targetPage,
  onTargetChange,
  onCheck,
  onReset,
}: TargetSelectorProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">目标页面</CardTitle>
        <CardDescription>选择要检查的目标页面</CardDescription>
      </CardHeader>
      <CardContent>
        <select
          className="w-full bg-slate-800 border-slate-700 rounded px-3 py-2"
          value={targetPage}
          onChange={(e) => onTargetChange(e.target.value)}
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (需要 {p.requiredRole})
            </option>
          ))}
        </select>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1 cursor-pointer" onClick={onCheck}>
            <Shield className="w-4 h-4 mr-2" />
            检查可达性
          </Button>
          <Button variant="outline" onClick={onReset} className="cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
