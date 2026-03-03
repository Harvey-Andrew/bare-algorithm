'use client';

import { Shield } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { PermissionGraph } from './components/PermissionGraph';
import { ResultCard } from './components/ResultCard';
import { RoleSelector } from './components/RoleSelector';
import { TargetSelector } from './components/TargetSelector';
import { usePermission } from './hooks/usePermission';

/**
 * 权限可达性 Demo 页面
 */
export default function PermissionReachDemo() {
  const {
    pages,
    roles,
    currentRole,
    targetPage,
    result,
    reachablePages,
    checkReachability,
    reset,
    changeRole,
    changeTargetPage,
  } = usePermission();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/graph" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">权限可达性</h1>
                <p className="text-sm text-slate-400">页面访问路径、权限判断</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：控制面板 */}
          <div className="space-y-6">
            <RoleSelector roles={roles} currentRole={currentRole} onRoleChange={changeRole} />

            <TargetSelector
              pages={pages}
              targetPage={targetPage}
              onTargetChange={changeTargetPage}
              onCheck={checkReachability}
              onReset={reset}
            />

            <ResultCard result={result} pages={pages} />
          </div>

          {/* 右侧：可视化 */}
          <div className="lg:col-span-2">
            <PermissionGraph
              pages={pages}
              targetPage={targetPage}
              result={result}
              reachablePages={reachablePages}
            />
          </div>
        </div>

        <AlgorithmInfo />
      </main>
    </div>
  );
}
