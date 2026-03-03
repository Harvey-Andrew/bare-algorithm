'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * 自适应缩放容器
 * 监听容器与内容尺寸，当内容超出容器时按比例缩放到可视区域内。
 */
export function ScaleToFit({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let frameId: number | null = null;

    const updateScale = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const sw = content.scrollWidth;
      const sh = content.scrollHeight;

      if (sw <= 0 || sh <= 0) return;

      const nextScale = Math.min(cw / sw, ch / sh, 1);
      setScale((prev) => (Math.abs(prev - nextScale) < 0.001 ? prev : nextScale));
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateScale();
      });
    };

    scheduleUpdate();

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
    resizeObserver.observe(content);

    const mutationObserver = new MutationObserver(scheduleUpdate);
    mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

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
