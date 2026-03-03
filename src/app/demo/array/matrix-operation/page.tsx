'use client';

import { Grid3x3 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { MatrixGrid } from './components/MatrixGrid';
import { OperationPanel } from './components/OperationPanel';
import { useMatrix } from './hooks/useMatrix';

/**
 * 矩阵操作 Demo 页面
 * 矩阵置零、旋转、转置、螺旋遍历
 */
export default function MatrixOperationDemo() {
  const {
    matrix,
    highlightedCells,
    spiralResult,
    metrics,
    executeOperation,
    regenerateMatrix,
    resizeMatrix,
  } = useMatrix();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/array" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Grid3x3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">矩阵操作</h1>
                <p className="text-sm text-slate-400">置零 O(1)空间 · 原地旋转 · 螺旋遍历</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧操作面板 */}
          <div>
            <OperationPanel
              currentSize={{ rows: matrix.rows, cols: matrix.cols }}
              metrics={metrics}
              spiralResult={spiralResult}
              onOperation={executeOperation}
              onRegenerate={() => regenerateMatrix()}
              onResize={resizeMatrix}
            />
          </div>

          {/* 右侧矩阵展示 */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center">
            <MatrixGrid matrix={matrix} highlightedCells={highlightedCells} />

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg mt-6 w-full max-w-xl">
              <h3 className="text-lg font-bold mb-3">📐 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">图像处理 / 游戏开发</strong> - 矩阵旋转、变换操作
                </p>
                <p>
                  <strong className="text-green-400">矩阵置零</strong>: 原地 O(1)
                  空间，用首行首列做标记
                </p>
                <p>
                  <strong className="text-cyan-400">螺旋遍历</strong>: 四指针边界收缩
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
