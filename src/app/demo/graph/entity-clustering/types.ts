'use client';

/**
 * 实体类型
 */
export interface Entity {
  id: number;
  name: string;
  phone: string;
  address: string;
}

/**
 * 聚类结果
 */
export interface ClusterResult {
  groupId: number;
  entities: Entity[];
  matchReason: string;
}

/**
 * 检测结果
 */
export interface DetectionResult {
  clusters: ClusterResult[];
  matchReasons: Map<string, string>;
}

/**
 * 新实体输入
 */
export interface NewEntityInput {
  name: string;
  phone: string;
  address: string;
}
