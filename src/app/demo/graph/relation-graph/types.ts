'use client';

/**
 * 图节点
 */
export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * 图边
 */
export interface GraphEdge {
  source: string;
  target: string;
}

/**
 * 初始节点数据（不含位置）
 */
export interface InitialNode {
  id: string;
  name: string;
}

/**
 * SVG 配置
 */
export interface SvgConfig {
  width: number;
  height: number;
  nodeRadius: number;
}
