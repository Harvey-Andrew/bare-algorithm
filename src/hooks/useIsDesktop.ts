'use client';

import { useEffect, useState } from 'react';

const DESKTOP_BREAKPOINT = 768;

/**
 * 判断当前设备是否为桌面端（基于视口宽度）。
 * 服务端渲染时默认返回 true，客户端挂载后根据实际宽度更新。
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isDesktop;
}
