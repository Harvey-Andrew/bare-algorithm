import type { Matrix } from './types';

/**
 * 生成随机矩阵
 */
export function generateRandomMatrix(rows: number, cols: number): Matrix {
  const data: number[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      // 随机生成 0-99，约 15% 概率生成 0
      const value = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * 99) + 1;
      row.push(value);
    }
    data.push(row);
  }

  return { rows, cols, data };
}

/**
 * 预设矩阵尺寸
 */
export const MATRIX_SIZES = [
  { rows: 4, cols: 4, label: '4×4' },
  { rows: 5, cols: 5, label: '5×5' },
  { rows: 6, cols: 6, label: '6×6' },
  { rows: 8, cols: 8, label: '8×8' },
];

/**
 * 配置
 */
export const CONFIG = {
  DEFAULT_ROWS: 5,
  DEFAULT_COLS: 5,
  ANIMATION_DELAY: 100,
};
