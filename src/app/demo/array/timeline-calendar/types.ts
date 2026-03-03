'use client';

/**
 * 会议数据结构 - 模拟企业会议室预订
 */
export interface Meeting {
  /** 会议 ID */
  id: string;
  /** 会议标题 */
  title: string;
  /** 开始时间（时间戳） */
  startTime: number;
  /** 结束时间（时间戳） */
  endTime: number;
  /** 会议室 */
  roomId: string;
  /** 组织者 */
  organizer: string;
  /** 参与人数 */
  attendees: number;
  /** 优先级 */
  priority: 'high' | 'normal' | 'low';
  /** 状态 */
  status: 'confirmed' | 'tentative' | 'cancelled';
}

/**
 * 时间槽 - 表示一个时间区间
 */
export interface TimeSlot {
  start: number;
  end: number;
}

/**
 * 冲突信息
 */
export interface ConflictInfo {
  meeting1: Meeting;
  meeting2: Meeting;
  overlapStart: number;
  overlapEnd: number;
  overlapMinutes: number;
}

/**
 * 空闲时段
 */
export interface FreeSlot {
  start: number;
  end: number;
  duration: number; // 分钟
}

/**
 * 合并后的区间
 */
export interface MergedInterval {
  start: number;
  end: number;
  meetings: Meeting[];
}

/**
 * 分析结果
 */
export interface AnalysisResult {
  conflicts: ConflictInfo[];
  freeSlots: FreeSlot[];
  mergedIntervals: MergedInterval[];
  utilizationRate: number; // 会议室使用率
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  sortTime: number;
  conflictDetectTime: number;
  mergeTime: number;
  totalMeetings: number;
}

/**
 * 会议室
 */
export interface Room {
  id: string;
  name: string;
  capacity: number;
}
