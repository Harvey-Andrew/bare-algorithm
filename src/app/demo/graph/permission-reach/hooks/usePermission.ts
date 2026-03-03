'use client';

import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_PAGES, DEFAULT_ROLES, PAGE_LINKS } from '../constants';
import { findPath, getAllReachablePages } from '../services/permission.api';
import type { PageNode, PathResult, Role } from '../types';

/**
 * 权限可达性状态管理 Hook
 */
export function usePermission() {
  const [pages] = useState<PageNode[]>(DEFAULT_PAGES);
  const [roles] = useState<Role[]>(DEFAULT_ROLES);
  const [currentRole, setCurrentRole] = useState<string>('user');
  const [targetPage, setTargetPage] = useState<string>('settings');
  const [result, setResult] = useState<PathResult | null>(null);

  // 当前权限
  const currentPermissions = useMemo(() => {
    return roles.find((r) => r.id === currentRole)?.permissions || [];
  }, [roles, currentRole]);

  // 可达页面
  const reachablePages = useMemo(() => {
    return getAllReachablePages(pages, PAGE_LINKS, 'home', currentPermissions);
  }, [pages, currentPermissions]);

  // 检查可达性
  const checkReachability = useCallback(() => {
    const res = findPath(pages, PAGE_LINKS, 'home', targetPage, currentPermissions);
    setResult(res);
  }, [pages, targetPage, currentPermissions]);

  // 重置
  const reset = useCallback(() => {
    setResult(null);
  }, []);

  // 切换角色
  const changeRole = useCallback((roleId: string) => {
    setCurrentRole(roleId);
    setResult(null);
  }, []);

  // 切换目标页面
  const changeTargetPage = useCallback((pageId: string) => {
    setTargetPage(pageId);
    setResult(null);
  }, []);

  return {
    // 数据
    pages,
    roles,
    currentRole,
    targetPage,
    result,
    reachablePages,

    // 操作
    checkReachability,
    reset,
    changeRole,
    changeTargetPage,
  };
}
