import type { Player } from './types';

/**
 * 昵称列表
 */
const NICKNAMES = [
  '暴风战神',
  '幻影刺客',
  '光明使者',
  '暗夜猎手',
  '烈焰法师',
  '冰霜女王',
  '雷霆之怒',
  '神圣骑士',
  '死亡领主',
  '虚空行者',
  '天使之翼',
  '恶魔之眼',
  '龙之传人',
  '凤凰涅槃',
  '星辰守护',
];

/**
 * 公会列表
 */
const GUILDS = ['龙腾战队', '星辰战盟', '凤凰涅槃', '暗影军团', '烈焰传奇'];

/**
 * 头像颜色
 */
const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-teal-500',
];

/**
 * 生成模拟玩家数据
 */
export function generateMockPlayers(count: number = 10000): Player[] {
  const players: Player[] = [];

  for (let i = 0; i < count; i++) {
    const totalGames = Math.floor(Math.random() * 1000) + 10;
    const winRate = 0.3 + Math.random() * 0.5; // 30%-80% 胜率
    const wins = Math.floor(totalGames * winRate);

    players.push({
      id: `player-${String(i + 1).padStart(6, '0')}`,
      nickname: `${NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)]}${Math.floor(Math.random() * 1000)}`,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      score: Math.floor(Math.random() * 100000),
      level: Math.floor(Math.random() * 100) + 1,
      wins,
      totalGames,
      lastActiveTime: Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000),
      guild: Math.random() > 0.3 ? GUILDS[Math.floor(Math.random() * GUILDS.length)] : undefined,
    });
  }

  return players;
}

/**
 * 配置
 */
export const CONFIG = {
  /** 默认玩家数量 */
  DEFAULT_PLAYER_COUNT: 10000,
  /** 默认显示 Top-K */
  DEFAULT_TOP_K: 100,
  /** 积分更新间隔（模拟） */
  UPDATE_INTERVAL_MS: 3000,
};
