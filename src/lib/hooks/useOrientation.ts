'use client';

import { useEffect, useState } from 'react';

export type Orientation = 'portrait' | 'landscape' | 'desktop';

/**
 * 检测设备方向和屏幕类型
 * - desktop: 屏幕宽度 >= 1024px (lg 断点)
 * - landscape: 宽度 < 1024px 且横屏
 * - portrait: 宽度 < 1024px 且竖屏
 * - null: 尚未检测（SSR / hydration 前）
 */
export function useOrientation(): Orientation | null {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  useEffect(() => {
    const lgQuery = window.matchMedia('(min-width: 1024px)');
    const landscapeQuery = window.matchMedia('(orientation: landscape)');

    const update = () => {
      if (lgQuery.matches) {
        setOrientation('desktop');
      } else if (landscapeQuery.matches) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    update();
    lgQuery.addEventListener('change', update);
    landscapeQuery.addEventListener('change', update);
    return () => {
      lgQuery.removeEventListener('change', update);
      landscapeQuery.removeEventListener('change', update);
    };
  }, []);

  return orientation;
}
