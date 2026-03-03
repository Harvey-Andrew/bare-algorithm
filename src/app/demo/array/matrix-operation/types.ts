'use client';

/**
 * 单元格数据
 */
export interface Cell {
  row: number;
  col: number;
  value: number;
  isHighlighted: boolean;
  isZeroed: boolean;
}

/**
 * 矩阵数据
 */
export interface Matrix {
  rows: number;
  cols: number;
  data: number[][];
}

/**
 * 操作类型
 */
export type OperationType = 'setZero' | 'rotate' | 'transpose' | 'spiralOrder';

/**
 * 操作记录
 */
export interface Operation {
  type: OperationType;
  timestamp: number;
  duration: number;
  description: string;
}

/**
 * 操作结果
 */
export interface OperationResult {
  matrix: Matrix;
  time: number;
  highlightedCells: [number, number][];
  spiralResult?: number[];
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  lastOperationTime: number;
  matrixSize: number;
  operationCount: number;
}
