'use client';

/**
 * 玩家数据结构 - 模拟游戏排行榜
 */
export interface Player {
  /** 玩家 ID */
  id: string;
  /** 玩家昵称 */
  nickname: string;
  /** 头像颜色 */
  avatarColor: string;
  /** 当前积分 */
  score: number;
  /** 等级 */
  level: number;
  /** 胜场数 */
  wins: number;
  /** 总场次 */
  totalGames: number;
  /** 最后活跃时间 */
  lastActiveTime: number;
  /** 所属公会 */
  guild?: string;
}

/**
 * 排行榜条目
 */
export interface RankEntry {
  rank: number;
  player: Player;
  rankChange: number; // 排名变化（正数上升，负数下降）
}

/**
 * 排行榜状态
 */
export interface LeaderboardState {
  entries: RankEntry[];
  totalPlayers: number;
  lastUpdateTime: number;
}

/**
 * 积分变更事件
 */
export interface ScoreChangeEvent {
  playerId: string;
  delta: number;
  reason: string;
  timestamp: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  sortTime: number;
  topKTime: number;
  totalPlayers: number;
  displayCount: number;
}

/**
 * Top-K 查询参数
 */
export interface TopKParams {
  k: number;
  algorithm: 'sort' | 'quickSelect' | 'heap';
}
