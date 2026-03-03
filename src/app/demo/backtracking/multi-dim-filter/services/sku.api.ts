/**
 * 多维筛选组合生成 - 回溯算法
 */

import type { FilterDimension, GenerationResult, SKUCombination } from '../types';

/**
 * 使用回溯法生成所有SKU组合
 */
export function generateCombinations(dimensions: FilterDimension[]): GenerationResult {
  const start = performance.now();
  const combinations: SKUCombination[] = [];
  const current: Record<string, string> = {};

  function backtrack(dimIndex: number) {
    if (dimIndex === dimensions.length) {
      combinations.push({
        id: `sku-${combinations.length}`,
        values: { ...current },
      });
      return;
    }

    const dim = dimensions[dimIndex];
    for (const option of dim.options) {
      current[dim.name] = option;
      backtrack(dimIndex + 1);
    }
    delete current[dim.name];
  }

  backtrack(0);

  return {
    combinations,
    totalCount: combinations.length,
    generationTime: performance.now() - start,
  };
}

/**
 * 计算预期组合数量
 */
export function calculateTotalCombinations(dimensions: FilterDimension[]): number {
  return dimensions.reduce((acc, dim) => acc * dim.options.length, 1);
}
