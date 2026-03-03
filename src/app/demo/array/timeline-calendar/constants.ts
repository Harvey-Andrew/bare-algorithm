import type { Meeting, Room } from './types';

/**
 * 会议室列表
 */
export const ROOMS: Room[] = [
  { id: 'room-a', name: '会议室 A', capacity: 10 },
  { id: 'room-b', name: '会议室 B', capacity: 20 },
  { id: 'room-c', name: '会议室 C', capacity: 6 },
];

/**
 * 会议标题模板
 */
const MEETING_TITLES = [
  '项目周会',
  '产品评审',
  '技术分享',
  '客户沟通',
  '团建策划',
  '需求对齐',
  '代码评审',
  '1v1 沟通',
  '晨会',
  '复盘会议',
];

/**
 * 组织者列表
 */
const ORGANIZERS = ['张三', '李四', '王五', '赵六', '钱七'];

/**
 * 生成模拟会议数据
 * 包含脏数据：时间重叠、跨天会议
 */
export function generateMockMeetings(count: number = 30): Meeting[] {
  const meetings: Meeting[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseTime = today.getTime();

  // 工作时间：9:00-18:00
  const workStart = 9 * 60; // 分钟
  const workEnd = 18 * 60;

  for (let i = 0; i < count; i++) {
    const roomId = ROOMS[Math.floor(Math.random() * ROOMS.length)].id;

    // 随机开始时间（9:00-17:00）
    const startMinute = workStart + Math.floor(Math.random() * (workEnd - workStart - 60));
    const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)]; // 30分钟-2小时
    const endMinute = Math.min(startMinute + duration, workEnd);

    const startTime = baseTime + startMinute * 60 * 1000;
    const endTime = baseTime + endMinute * 60 * 1000;

    meetings.push({
      id: `meeting-${String(i + 1).padStart(3, '0')}`,
      title: MEETING_TITLES[Math.floor(Math.random() * MEETING_TITLES.length)],
      startTime,
      endTime,
      roomId,
      organizer: ORGANIZERS[Math.floor(Math.random() * ORGANIZERS.length)],
      attendees: Math.floor(Math.random() * 10) + 2,
      priority: ['high', 'normal', 'low'][Math.floor(Math.random() * 3)] as Meeting['priority'],
      status: Math.random() > 0.1 ? 'confirmed' : 'tentative',
    });
  }

  // 添加一些故意重叠的会议（模拟冲突）
  const overlapCount = Math.floor(count * 0.2);
  for (let i = 0; i < overlapCount && i < meetings.length; i++) {
    const original = meetings[i];
    const overlapStart = original.startTime + 15 * 60 * 1000; // 15分钟后开始
    const overlapEnd = overlapStart + 45 * 60 * 1000;

    meetings.push({
      id: `meeting-overlap-${i}`,
      title: `${MEETING_TITLES[Math.floor(Math.random() * MEETING_TITLES.length)]}（冲突）`,
      startTime: overlapStart,
      endTime: overlapEnd,
      roomId: original.roomId, // 同一会议室
      organizer: ORGANIZERS[Math.floor(Math.random() * ORGANIZERS.length)],
      attendees: Math.floor(Math.random() * 5) + 2,
      priority: 'high',
      status: 'confirmed',
    });
  }

  return meetings;
}

/**
 * 配置
 */
export const CONFIG = {
  /** 默认会议数量 */
  DEFAULT_MEETING_COUNT: 30,
  /** 工作日开始（小时） */
  WORK_START_HOUR: 9,
  /** 工作日结束（小时） */
  WORK_END_HOUR: 18,
};
