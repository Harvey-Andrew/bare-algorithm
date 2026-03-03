'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEFAULT_CONFIG, generateMockMessages, PERFORMANCE_CONFIG } from '../constants';
import {
  calculateTotalHeight,
  calculateVisibleRange,
  getVisibleItems,
} from '../services/virtualScroll.api';
import type { Message, PerformanceMetrics, VirtualListConfig, VisibleRange } from '../types';

/**
 * 虚拟列表状态管理 Hook
 */
export function useVirtualList(initialCount: number = PERFORMANCE_CONFIG.DEFAULT_COUNT) {
  // 原始数据（懒初始化）
  const [allItems] = useState<Message[]>(() => generateMockMessages(initialCount));

  // 虚拟列表配置
  const [config] = useState<VirtualListConfig>(DEFAULT_CONFIG);

  // 滚动容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 可见区域状态
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    startIndex: 0,
    endIndex: 20,
    offsetTop: 0,
  });

  // 性能指标
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalItems: initialCount,
    renderedItems: 0,
    renderRatio: 0,
    fps: 60,
    lastCalcTime: 0,
  });

  // FPS 计算（初始值设为 0，在 useEffect 中初始化实际时间）
  const fpsRef = useRef({ frames: 0, lastTime: 0 });

  // 总高度
  const totalHeight = useMemo(
    () => calculateTotalHeight(allItems.length, config.itemHeight),
    [allItems.length, config.itemHeight]
  );

  // 可见项
  const visibleItems = useMemo(
    () => getVisibleItems(allItems, visibleRange),
    [allItems, visibleRange]
  );

  /**
   * 处理滚动事件
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const { range, calcTime } = calculateVisibleRange(
      scrollTop,
      clientHeight,
      allItems.length,
      config
    );

    setVisibleRange(range);

    // 更新性能指标
    const renderedItems = range.endIndex - range.startIndex + 1;
    setMetrics((prev) => ({
      ...prev,
      renderedItems,
      renderRatio: renderedItems / allItems.length,
      lastCalcTime: calcTime,
    }));

    // FPS 计算
    fpsRef.current.frames++;
  }, [allItems.length, config]);

  /**
   * FPS 计算器
   */
  useEffect(() => {
    // 初始化 lastTime（在客户端 effect 中调用 performance.now 是安全的）
    if (fpsRef.current.lastTime === 0) {
      fpsRef.current.lastTime = performance.now();
    }

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - fpsRef.current.lastTime;
      const fps = Math.round((fpsRef.current.frames * 1000) / elapsed);

      setMetrics((prev) => ({ ...prev, fps: Math.min(fps, 60) }));

      fpsRef.current = { frames: 0, lastTime: now };
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 初始化可见区域
   */
  useEffect(() => {
    if (containerRef.current) {
      handleScroll();
    }
  }, [handleScroll]);

  /**
   * 滚动到顶部
   */
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  /**
   * 滚动到底部
   */
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = totalHeight;
    }
  }, [totalHeight]);

  /**
   * 滚动到指定索引
   */
  const scrollToIndex = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * config.itemHeight;
      }
    },
    [config.itemHeight]
  );

  return {
    // 数据
    allItems,
    visibleItems,
    visibleRange,
    totalHeight,
    config,
    metrics,

    // 引用
    containerRef,

    // 操作
    handleScroll,
    scrollToTop,
    scrollToBottom,
    scrollToIndex,
  };
}
