'use client';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { TopologyPanel } from './components/TopologyPanel';
import { useNetworkConnectivity } from './hooks/useNetworkConnectivity';

/**
 * 网络连通性检测 Demo 页面
 */
export default function NetworkConnectivityDemo() {
  const {
    nodes,
    edges,
    results,
    isChecking,
    newNodeName,
    unhealthyComponents,
    partitionCount,
    setNewNodeName,
    runCheck,
    reset,
    addNode,
    removeNode,
    toggleNodeStatus,
    removeEdge,
  } = useNetworkConnectivity();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <BackButton fallbackHref="/problems/graph" />
          <h1 className="text-3xl font-bold">网络连通性检测</h1>
        </div>
        <p className="text-muted-foreground pl-14">
          使用 BFS 算法检测分布式系统中的网络分区，识别不可达节点和断开的集群
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左侧：网络拓扑 */}
        <div className="space-y-6">
          <TopologyPanel
            nodes={nodes}
            edges={edges}
            newNodeName={newNodeName}
            onNewNodeNameChange={setNewNodeName}
            onAddNode={addNode}
            onRemoveNode={removeNode}
            onToggleNodeStatus={toggleNodeStatus}
            onRemoveEdge={removeEdge}
          />

          <ControlPanel isChecking={isChecking} onCheck={runCheck} onReset={reset} />
        </div>

        {/* 右侧：结果展示 */}
        <ResultsDisplay
          results={results}
          partitionCount={partitionCount}
          unhealthyCount={unhealthyComponents.length}
        />
      </div>

      <AlgorithmInfo />
    </div>
  );
}
