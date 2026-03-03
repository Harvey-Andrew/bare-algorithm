'use client';

import type { Matrix } from '../types';

interface MatrixGridProps {
  matrix: Matrix;
  highlightedCells: [number, number][];
}

/**
 * 矩阵网格组件
 */
export function MatrixGrid({ matrix, highlightedCells }: MatrixGridProps) {
  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(([r, c]) => r === row && c === col);
  };

  const isZero = (value: number) => value === 0;

  const cellSize = matrix.rows > 6 ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';

  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-slate-900 rounded-lg border border-slate-800">
      {matrix.data.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((value, j) => (
            <div
              key={`${i}-${j}`}
              className={`
                ${cellSize} flex items-center justify-center rounded font-mono font-medium
                ${
                  isZero(value)
                    ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                    : isHighlighted(i, j)
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800 text-white border border-slate-700'
                }
                transition-all duration-200
              `}
            >
              {value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
