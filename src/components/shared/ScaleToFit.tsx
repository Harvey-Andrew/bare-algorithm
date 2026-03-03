'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 自适应缩放容器
 * 监听容器与内容的尺寸，当内容超出容器时自动等比缩放以适配。
 * 用于可视化器渲染区域，确保移动端不溢出。
 */
export function ScaleToFit({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const updateScale = () => {
      // 重置缩放以获取内容原始尺寸
      content.style.transform = 'scale(1)';

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const sw = content.scrollWidth;
      const sh = content.scrollHeight;

      if (sw <= 0 || sh <= 0) return;

      const scaleX = cw / sw;
      const scaleY = ch / sh;
      const newScale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小

      setScale(newScale);
      content.style.transform = `scale(${newScale})`;
    };

    // 初始计算
    updateScale();

    // 监听容器尺寸变化
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    // 监听内容变化（子元素增减导致尺寸变化）
    const mutationObserver = new MutationObserver(updateScale);
    mutationObserver.observe(content, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef}
        className="flex items-center justify-center"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
