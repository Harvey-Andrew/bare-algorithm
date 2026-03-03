'use client';

/**
 * 页面节点
 */
export interface PageNode {
  id: string;
  name: string;
  requiredRole: string;
}

/**
 * 角色
 */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

/**
 * 页面跳转链接
 */
export interface PageLink {
  from: string;
  to: string;
}

/**
 * 路径查找结果
 */
export interface PathResult {
  path: string[] | null;
  reachable: boolean;
  blockedAt: string | null;
}

/**
 * 节点位置
 */
export interface NodePosition {
  x: number;
  y: number;
}
