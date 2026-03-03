'use client';

export interface NestedEntity {
  id: string;
  name: string;
  children?: NestedEntity[];
  parentId?: string;
}

export interface FlatEntity {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
}

export interface NormalizedData {
  byId: Record<string, FlatEntity>;
  allIds: string[];
  rootIds: string[];
}

export interface PerformanceMetrics {
  flattenTime: number;
  nestTime: number;
  entityCount: number;
}
