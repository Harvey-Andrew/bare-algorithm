'use client';

import { useCallback, useState } from 'react';

import { CONFIG, generateRandomMatrix } from '../constants';
import {
  rotateMatrix,
  setMatrixZeroes,
  spiralOrder,
  transposeMatrix,
} from '../services/matrix.api';
import type { Matrix, Operation, OperationType, PerformanceMetrics } from '../types';

/**
 * 矩阵操作状态管理 Hook
 */
export function useMatrix() {
  // 矩阵数据
  const [matrix, setMatrix] = useState<Matrix>(() =>
    generateRandomMatrix(CONFIG.DEFAULT_ROWS, CONFIG.DEFAULT_COLS)
  );

  // 操作历史
  const [operations, setOperations] = useState<Operation[]>([]);

  // 高亮单元格
  const [highlightedCells, setHighlightedCells] = useState<[number, number][]>([]);

  // 螺旋遍历结果
  const [spiralResult, setSpiralResult] = useState<number[] | null>(null);

  // 性能指标
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastOperationTime: 0,
    matrixSize: CONFIG.DEFAULT_ROWS * CONFIG.DEFAULT_COLS,
    operationCount: 0,
  });

  /**
   * 执行操作
   */
  const executeOperation = useCallback(
    (type: OperationType) => {
      let result;
      let description = '';

      switch (type) {
        case 'setZero':
          result = setMatrixZeroes(matrix);
          description = '矩阵置零';
          setMatrix(result.matrix);
          setHighlightedCells(result.highlightedCells);
          setSpiralResult(null);
          break;
        case 'rotate':
          result = rotateMatrix(matrix);
          description = '顺时针旋转 90°';
          setMatrix(result.matrix);
          setHighlightedCells([]);
          setSpiralResult(null);
          break;
        case 'transpose':
          result = transposeMatrix(matrix);
          description = '矩阵转置';
          setMatrix(result.matrix);
          setHighlightedCells([]);
          setSpiralResult(null);
          break;
        case 'spiralOrder':
          result = spiralOrder(matrix);
          description = '螺旋遍历';
          setHighlightedCells(result.highlightedCells);
          setSpiralResult(result.spiralResult || null);
          break;
      }

      if (result) {
        setOperations((prev) => [
          ...prev,
          {
            type,
            timestamp: Date.now(),
            duration: result.time,
            description,
          },
        ]);

        setMetrics((prev) => ({
          ...prev,
          lastOperationTime: result.time,
          operationCount: prev.operationCount + 1,
        }));
      }
    },
    [matrix]
  );

  /**
   * 重新生成矩阵
   */
  const regenerateMatrix = useCallback(
    (rows?: number, cols?: number) => {
      const newMatrix = generateRandomMatrix(rows || matrix.rows, cols || matrix.cols);
      setMatrix(newMatrix);
      setHighlightedCells([]);
      setSpiralResult(null);
      setOperations([]);
      setMetrics((prev) => ({
        ...prev,
        matrixSize: newMatrix.rows * newMatrix.cols,
        operationCount: 0,
      }));
    },
    [matrix.rows, matrix.cols]
  );

  /**
   * 调整矩阵大小
   */
  const resizeMatrix = useCallback(
    (rows: number, cols: number) => {
      regenerateMatrix(rows, cols);
    },
    [regenerateMatrix]
  );

  return {
    // 数据
    matrix,
    highlightedCells,
    spiralResult,
    operations,
    metrics,

    // 操作
    executeOperation,
    regenerateMatrix,
    resizeMatrix,
  };
}
