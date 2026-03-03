'use client';

import type { Message, VirtualListConfig, VisibleRange } from '../types';
import { MessageItem } from './MessageItem';

interface VirtualListContainerProps {
  items: Message[];
  visibleRange: VisibleRange;
  totalHeight: number;
  config: VirtualListConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

/**
 * 虚拟滚动容器组件
 */
export function VirtualListContainer({
  items,
  visibleRange,
  totalHeight,
  config,
  containerRef,
  onScroll,
}: VirtualListContainerProps) {
  return (
    <div
      ref={containerRef}
      className="h-[600px] overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg"
      onScroll={onScroll}
    >
      {/* 占位容器 - 撑起完整高度 */}
      <div className="relative" style={{ height: `${totalHeight}px` }}>
        {/* 可见项容器 - 使用 transform 定位 */}
        <div
          className="absolute left-0 right-0"
          style={{ transform: `translateY(${visibleRange.offsetTop}px)` }}
        >
          {items.map((item, index) => (
            <MessageItem
              key={item.id}
              message={item}
              height={config.itemHeight}
              index={visibleRange.startIndex + index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
