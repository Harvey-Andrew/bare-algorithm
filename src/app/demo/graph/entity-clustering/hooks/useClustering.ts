'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_DATA } from '../constants';
import { detectDuplicates } from '../services/clustering.api';
import type { ClusterResult, Entity, NewEntityInput } from '../types';

/**
 * 实体聚类状态管理 Hook
 */
export function useClustering() {
  const [entities, setEntities] = useState<Entity[]>(DEFAULT_DATA);
  const [results, setResults] = useState<ClusterResult[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newEntity, setNewEntity] = useState<NewEntityInput>({
    name: '',
    phone: '',
    address: '',
  });

  // 运行检测
  const runDetection = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      const { clusters } = detectDuplicates(entities);
      setResults(clusters);
      setIsProcessing(false);
    }, 800);
  }, [entities]);

  // 重置
  const reset = useCallback(() => {
    setEntities(DEFAULT_DATA);
    setResults(null);
  }, []);

  // 添加实体
  const addEntity = useCallback(() => {
    if (newEntity.name && newEntity.phone && newEntity.address) {
      setEntities((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...newEntity,
        },
      ]);
      setNewEntity({ name: '', phone: '', address: '' });
      setResults(null);
    }
  }, [newEntity]);

  // 删除实体
  const removeEntity = useCallback((id: number) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setResults(null);
  }, []);

  // 更新新实体表单
  const updateNewEntity = useCallback((field: keyof NewEntityInput, value: string) => {
    setNewEntity((prev) => ({ ...prev, [field]: value }));
  }, []);

  // 计算统计
  const duplicateClusters = results?.filter((c) => c.entities.length > 1) || [];
  const uniqueEntities = results?.filter((c) => c.entities.length === 1) || [];

  return {
    // 数据
    entities,
    results,
    isProcessing,
    newEntity,
    duplicateClusters,
    uniqueEntities,

    // 操作
    runDetection,
    reset,
    addEntity,
    removeEntity,
    updateNewEntity,
  };
}
