'use client';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { ClusterResults } from './components/ClusterResults';
import { ControlPanel } from './components/ControlPanel';
import { EntityTable } from './components/EntityTable';
import { useClustering } from './hooks/useClustering';

/**
 * 实体聚类 Demo 页面
 */
export default function EntityClusteringDemo() {
  const {
    entities,
    results,
    isProcessing,
    newEntity,
    duplicateClusters,
    uniqueEntities,
    runDetection,
    reset,
    addEntity,
    removeEntity,
    updateNewEntity,
  } = useClustering();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <BackButton fallbackHref="/problems/graph" />
          <h1 className="text-3xl font-bold">重复实体检测工具</h1>
        </div>
        <p className="text-muted-foreground pl-14">
          使用并查集算法自动识别数据库中的重复记录，支持电话、姓名、地址多维度匹配
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左侧：数据输入 */}
        <div className="space-y-6">
          <EntityTable
            entities={entities}
            newEntity={newEntity}
            onRemoveEntity={removeEntity}
            onUpdateNewEntity={updateNewEntity}
            onAddEntity={addEntity}
          />

          <ControlPanel isProcessing={isProcessing} onRunDetection={runDetection} onReset={reset} />
        </div>

        {/* 右侧：结果展示 */}
        <ClusterResults
          results={results}
          duplicateClusters={duplicateClusters}
          uniqueEntities={uniqueEntities}
        />
      </div>

      <AlgorithmInfo />
    </div>
  );
}
