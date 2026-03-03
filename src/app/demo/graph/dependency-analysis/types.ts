'use client';

/**
 * 模块类型
 */
export interface Module {
  id: string;
  name: string;
}

/**
 * 依赖关系
 */
export interface Dependency {
  from: string;
  to: string;
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  /** 拓扑排序结果，若有环则为 null */
  order: string[] | null;
  /** 是否存在循环依赖 */
  hasCycle: boolean;
  /** 参与循环的节点集合 */
  cycleNodes: Set<string>;
}

/**
 * 节点位置
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * SVG 配置
 */
export interface SvgConfig {
  width: number;
  height: number;
  nodeRadius: number;
}
