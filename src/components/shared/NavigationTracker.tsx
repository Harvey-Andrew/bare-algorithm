'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { incrementNavCount } from '@/lib/nav-tracker';

/**
 * 导航追踪组件：放在 root layout 中，追踪应用内 SPA 导航次数。
 * 首次挂载（全页面加载）时跳过计数，后续路径变化（SPA 导航）时递增。
 */
export function NavigationTracker() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      // 首次挂载 = 全页面加载，不计数
      isFirstMount.current = false;
      return;
    }
    // 后续路径变化 = SPA 导航，递增计数
    incrementNavCount();
  }, [pathname]);

  return null;
}
