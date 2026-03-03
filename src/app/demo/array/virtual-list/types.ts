'use client';

/**
 * 消息数据结构 - 模拟社交 App 消息列表
 */
export interface Message {
  /** 消息 ID */
  id: string;
  /** 发送者 ID */
  senderId: string;
  /** 发送者昵称 */
  senderName: string;
  /** 发送者头像 */
  avatar: string;
  /** 消息内容 */
  content: string;
  /** 发送时间 */
  timestamp: number;
  /** 消息类型 */
  type: 'text' | 'image' | 'system';
  /** 是否已读 */
  isRead: boolean;
}

/**
 * 滚动状态
 */
export interface ScrollState {
  /** 滚动位置 */
  scrollTop: number;
  /** 容器高度 */
  containerHeight: number;
  /** 内容总高度 */
  totalHeight: number;
}

/**
 * 可见区域范围
 */
export interface VisibleRange {
  /** 起始索引 */
  startIndex: number;
  /** 结束索引 */
  endIndex: number;
  /** 起始偏移量 */
  offsetTop: number;
}

/**
 * 虚拟列表配置
 */
export interface VirtualListConfig {
  /** 每项高度（固定高度模式） */
  itemHeight: number;
  /** 上下缓冲区项数 */
  overscan: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 总数据量 */
  totalItems: number;
  /** 实际渲染数量 */
  renderedItems: number;
  /** 渲染比例 */
  renderRatio: number;
  /** 帧率 */
  fps: number;
  /** 最近一次滚动计算耗时 */
  lastCalcTime: number;
}
