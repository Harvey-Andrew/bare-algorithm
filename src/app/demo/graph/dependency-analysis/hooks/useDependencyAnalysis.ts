'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_DEPS, DEFAULT_MODULES } from '../constants';
import { topologicalSort } from '../services/dependency.api';
import type { AnalysisResult, Dependency, Module } from '../types';

/**
 * 依赖分析状态管理 Hook
 */
export function useDependencyAnalysis() {
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [deps, setDeps] = useState<Dependency[]>(DEFAULT_DEPS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [newDepFrom, setNewDepFrom] = useState('');
  const [newDepTo, setNewDepTo] = useState('');

  /**
   * 运行依赖分析
   */
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = topologicalSort(modules, deps);
      setResult(res);
      setIsAnalyzing(false);
    }, 500);
  }, [modules, deps]);

  /**
   * 重置为默认状态
   */
  const reset = useCallback(() => {
    setModules(DEFAULT_MODULES);
    setDeps(DEFAULT_DEPS);
    setResult(null);
    setNewDepFrom('');
    setNewDepTo('');
  }, []);

  /**
   * 添加依赖关系
   */
  const addDep = useCallback(() => {
    if (newDepFrom && newDepTo && newDepFrom !== newDepTo) {
      const exists = deps.some((d) => d.from === newDepFrom && d.to === newDepTo);
      if (!exists) {
        setDeps((prev) => [...prev, { from: newDepFrom, to: newDepTo }]);
        setResult(null);
      }
    }
  }, [newDepFrom, newDepTo, deps]);

  /**
   * 删除依赖关系
   */
  const removeDep = useCallback((from: string, to: string) => {
    setDeps((prev) => prev.filter((d) => !(d.from === from && d.to === to)));
    setResult(null);
  }, []);

  return {
    // 状态
    modules,
    deps,
    isAnalyzing,
    result,
    newDepFrom,
    newDepTo,
    // 状态更新
    setNewDepFrom,
    setNewDepTo,
    // 操作
    runAnalysis,
    reset,
    addDep,
    removeDep,
  };
}
