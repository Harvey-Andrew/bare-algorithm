import type { Matrix, OperationResult } from '../types';

/**
 * 矩阵置零 (LeetCode #73)
 * 如果某个元素为 0，则将其所在行和列都置为 0
 * 时间复杂度: O(m*n)，空间复杂度: O(1)（使用首行首列标记）
 */
export function setMatrixZeroes(matrix: Matrix): OperationResult {
  const start = performance.now();
  const m = matrix.rows;
  const n = matrix.cols;
  const data = matrix.data.map((row) => [...row]);
  const highlightedCells: [number, number][] = [];

  // 标记首行首列是否需要置零
  let firstRowZero = false;
  let firstColZero = false;

  // 检查首行
  for (let j = 0; j < n; j++) {
    if (data[0][j] === 0) {
      firstRowZero = true;
      break;
    }
  }

  // 检查首列
  for (let i = 0; i < m; i++) {
    if (data[i][0] === 0) {
      firstColZero = true;
      break;
    }
  }

  // 使用首行首列作为标记
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (data[i][j] === 0) {
        data[i][0] = 0;
        data[0][j] = 0;
        highlightedCells.push([i, j]);
      }
    }
  }

  // 根据标记置零
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (data[i][0] === 0 || data[0][j] === 0) {
        data[i][j] = 0;
      }
    }
  }

  // 处理首行
  if (firstRowZero) {
    for (let j = 0; j < n; j++) {
      data[0][j] = 0;
    }
  }

  // 处理首列
  if (firstColZero) {
    for (let i = 0; i < m; i++) {
      data[i][0] = 0;
    }
  }

  return {
    matrix: { rows: m, cols: n, data },
    time: performance.now() - start,
    highlightedCells,
  };
}

/**
 * 矩阵旋转 90 度 (LeetCode #48)
 * 时间复杂度: O(n²)，空间复杂度: O(1)
 */
export function rotateMatrix(matrix: Matrix): OperationResult {
  const start = performance.now();
  const n = matrix.rows;
  const data = matrix.data.map((row) => [...row]);

  // 先转置
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [data[i][j], data[j][i]] = [data[j][i], data[i][j]];
    }
  }

  // 再水平翻转
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n / 2; j++) {
      [data[i][j], data[i][n - 1 - j]] = [data[i][n - 1 - j], data[i][j]];
    }
  }

  return {
    matrix: { rows: n, cols: n, data },
    time: performance.now() - start,
    highlightedCells: [],
  };
}

/**
 * 矩阵转置
 * 时间复杂度: O(m*n)
 */
export function transposeMatrix(matrix: Matrix): OperationResult {
  const start = performance.now();
  const m = matrix.rows;
  const n = matrix.cols;
  const data: number[][] = [];

  for (let j = 0; j < n; j++) {
    const row: number[] = [];
    for (let i = 0; i < m; i++) {
      row.push(matrix.data[i][j]);
    }
    data.push(row);
  }

  return {
    matrix: { rows: n, cols: m, data },
    time: performance.now() - start,
    highlightedCells: [],
  };
}

/**
 * 螺旋遍历 (LeetCode #54)
 * 时间复杂度: O(m*n)
 */
export function spiralOrder(matrix: Matrix): OperationResult {
  const start = performance.now();
  const result: number[] = [];
  const highlightedCells: [number, number][] = [];
  const m = matrix.rows;
  const n = matrix.cols;

  if (m === 0 || n === 0) {
    return {
      matrix,
      time: performance.now() - start,
      highlightedCells: [],
      spiralResult: [],
    };
  }

  let top = 0,
    bottom = m - 1,
    left = 0,
    right = n - 1;

  while (top <= bottom && left <= right) {
    // 向右
    for (let j = left; j <= right; j++) {
      result.push(matrix.data[top][j]);
      highlightedCells.push([top, j]);
    }
    top++;

    // 向下
    for (let i = top; i <= bottom; i++) {
      result.push(matrix.data[i][right]);
      highlightedCells.push([i, right]);
    }
    right--;

    // 向左
    if (top <= bottom) {
      for (let j = right; j >= left; j--) {
        result.push(matrix.data[bottom][j]);
        highlightedCells.push([bottom, j]);
      }
      bottom--;
    }

    // 向上
    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        result.push(matrix.data[i][left]);
        highlightedCells.push([i, left]);
      }
      left++;
    }
  }

  return {
    matrix,
    time: performance.now() - start,
    highlightedCells,
    spiralResult: result,
  };
}
