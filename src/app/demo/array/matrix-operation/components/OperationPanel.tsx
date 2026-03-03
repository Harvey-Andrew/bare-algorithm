'use client';

import { Columns, Grid3x3, RefreshCw, RotateCw, Shuffle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MATRIX_SIZES } from '../constants';
import type { OperationType, PerformanceMetrics } from '../types';

interface OperationPanelProps {
  currentSize: { rows: number; cols: number };
  metrics: PerformanceMetrics;
  spiralResult: number[] | null;
  onOperation: (type: OperationType) => void;
  onRegenerate: () => void;
  onResize: (rows: number, cols: number) => void;
}

/**
 * 操作面板组件
 */
export function OperationPanel({
  currentSize,
  metrics,
  spiralResult,
  onOperation,
  onRegenerate,
  onResize,
}: OperationPanelProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-cyan-400" />
          矩阵操作
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 尺寸选择 */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">矩阵尺寸</label>
          <div className="flex flex-wrap gap-1">
            {MATRIX_SIZES.map((size) => (
              <Button
                key={size.label}
                variant={
                  currentSize.rows === size.rows && currentSize.cols === size.cols
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => onResize(size.rows, size.cols)}
                className="cursor-pointer"
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-start"
            onClick={() => onOperation('setZero')}
          >
            <Columns className="w-4 h-4 mr-2" />
            矩阵置零
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-start"
            onClick={() => onOperation('rotate')}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            顺时针旋转 90°
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-start"
            onClick={() => onOperation('transpose')}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            矩阵转置
          </Button>
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-start"
            onClick={() => onOperation('spiralOrder')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            螺旋遍历
          </Button>
        </div>

        {/* 重新生成 */}
        <Button variant="outline" className="w-full cursor-pointer" onClick={onRegenerate}>
          重新生成矩阵
        </Button>

        {/* 螺旋遍历结果 */}
        {spiralResult && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="text-sm text-cyan-400 mb-1">螺旋遍历结果</div>
            <div className="text-xs text-white font-mono break-all">
              [{spiralResult.join(', ')}]
            </div>
          </div>
        )}

        {/* 性能指标 */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          <p>• 矩阵大小: {metrics.matrixSize} 个元素</p>
          <p>• 操作耗时: {metrics.lastOperationTime.toFixed(3)}ms</p>
          <p>• 已执行: {metrics.operationCount} 次操作</p>
        </div>
      </CardContent>
    </Card>
  );
}
