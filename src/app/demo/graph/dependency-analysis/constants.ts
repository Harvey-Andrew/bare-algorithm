import type { Dependency, Module, SvgConfig } from './types';

/**
 * 默认模块列表
 */
export const DEFAULT_MODULES: Module[] = [
  { id: 'A', name: 'App' },
  { id: 'B', name: 'Router' },
  { id: 'C', name: 'Store' },
  { id: 'D', name: 'Utils' },
  { id: 'E', name: 'API' },
  { id: 'F', name: 'UI' },
];

/**
 * 默认依赖关系
 */
export const DEFAULT_DEPS: Dependency[] = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'C', to: 'D' },
  { from: 'C', to: 'E' },
  { from: 'E', to: 'D' },
  { from: 'A', to: 'F' },
];

/**
 * SVG 可视化配置
 */
export const SVG_CONFIG: SvgConfig = {
  width: 600,
  height: 400,
  nodeRadius: 30,
};
