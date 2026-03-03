import { CONFIG } from '../constants';
import type { AnalysisResult, ConflictInfo, FreeSlot, Meeting, MergedInterval } from '../types';

/**
 * 按开始时间排序会议
 * 时间复杂度: O(n log n)
 */
export function sortMeetingsByStart(meetings: Meeting[]): Meeting[] {
  return [...meetings].sort((a, b) => a.startTime - b.startTime);
}

/**
 * 检测会议冲突（同一会议室）
 * 时间复杂度: O(n²) 最坏，O(n log n) 使用排序优化
 */
export function detectConflicts(meetings: Meeting[]): {
  conflicts: ConflictInfo[];
  detectTime: number;
} {
  const start = performance.now();
  const conflicts: ConflictInfo[] = [];

  // 按会议室分组
  const roomMeetings = new Map<string, Meeting[]>();
  for (const meeting of meetings) {
    if (meeting.status === 'cancelled') continue;
    if (!roomMeetings.has(meeting.roomId)) {
      roomMeetings.set(meeting.roomId, []);
    }
    roomMeetings.get(meeting.roomId)!.push(meeting);
  }

  // 对每个会议室检测冲突
  for (const [, roomList] of roomMeetings) {
    const sorted = sortMeetingsByStart(roomList);

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const m1 = sorted[i];
        const m2 = sorted[j];

        // 如果 m2 的开始时间已经超过 m1 的结束时间，后续不会有冲突
        if (m2.startTime >= m1.endTime) break;

        // 存在重叠
        const overlapStart = Math.max(m1.startTime, m2.startTime);
        const overlapEnd = Math.min(m1.endTime, m2.endTime);

        conflicts.push({
          meeting1: m1,
          meeting2: m2,
          overlapStart,
          overlapEnd,
          overlapMinutes: Math.round((overlapEnd - overlapStart) / 60000),
        });
      }
    }
  }

  const detectTime = performance.now() - start;
  return { conflicts, detectTime };
}

/**
 * 合并重叠区间
 * 时间复杂度: O(n log n)
 */
export function mergeIntervals(meetings: Meeting[]): {
  merged: MergedInterval[];
  mergeTime: number;
} {
  const start = performance.now();

  if (meetings.length === 0) {
    return { merged: [], mergeTime: 0 };
  }

  const sorted = sortMeetingsByStart(meetings.filter((m) => m.status !== 'cancelled'));
  const merged: MergedInterval[] = [];

  let current: MergedInterval = {
    start: sorted[0].startTime,
    end: sorted[0].endTime,
    meetings: [sorted[0]],
  };

  for (let i = 1; i < sorted.length; i++) {
    const meeting = sorted[i];

    if (meeting.startTime <= current.end) {
      // 重叠，合并
      current.end = Math.max(current.end, meeting.endTime);
      current.meetings.push(meeting);
    } else {
      // 不重叠，保存当前并开始新区间
      merged.push(current);
      current = {
        start: meeting.startTime,
        end: meeting.endTime,
        meetings: [meeting],
      };
    }
  }

  merged.push(current);

  const mergeTime = performance.now() - start;
  return { merged, mergeTime };
}

/**
 * 查找空闲时段
 * 时间复杂度: O(n)
 */
export function findFreeSlots(
  mergedIntervals: MergedInterval[],
  dayStart: number,
  dayEnd: number
): FreeSlot[] {
  const freeSlots: FreeSlot[] = [];

  let currentTime = dayStart;

  for (const interval of mergedIntervals) {
    if (interval.start > currentTime) {
      const duration = Math.round((interval.start - currentTime) / 60000);
      if (duration >= 15) {
        // 至少 15 分钟
        freeSlots.push({
          start: currentTime,
          end: interval.start,
          duration,
        });
      }
    }
    currentTime = Math.max(currentTime, interval.end);
  }

  // 检查最后一个区间到工作日结束
  if (currentTime < dayEnd) {
    const duration = Math.round((dayEnd - currentTime) / 60000);
    if (duration >= 15) {
      freeSlots.push({
        start: currentTime,
        end: dayEnd,
        duration,
      });
    }
  }

  return freeSlots;
}

/**
 * 计算会议室使用率
 */
export function calculateUtilization(
  mergedIntervals: MergedInterval[],
  dayStart: number,
  dayEnd: number
): number {
  const totalWorkMinutes = (dayEnd - dayStart) / 60000;
  let usedMinutes = 0;

  for (const interval of mergedIntervals) {
    usedMinutes += (interval.end - interval.start) / 60000;
  }

  return totalWorkMinutes > 0 ? usedMinutes / totalWorkMinutes : 0;
}

/**
 * 综合分析
 */
export function analyzeMeetings(
  meetings: Meeting[],
  selectedRoom?: string
): {
  result: AnalysisResult;
  metrics: { sortTime: number; conflictDetectTime: number; mergeTime: number };
} {
  // 过滤会议室
  const filteredMeetings = selectedRoom
    ? meetings.filter((m) => m.roomId === selectedRoom)
    : meetings;

  // 今天的工作时间范围
  const today = new Date();
  today.setHours(CONFIG.WORK_START_HOUR, 0, 0, 0);
  const dayStart = today.getTime();
  today.setHours(CONFIG.WORK_END_HOUR, 0, 0, 0);
  const dayEnd = today.getTime();

  const sortStart = performance.now();
  const sorted = sortMeetingsByStart(filteredMeetings);
  const sortTime = performance.now() - sortStart;

  const { conflicts, detectTime: conflictDetectTime } = detectConflicts(sorted);
  const { merged: mergedIntervals, mergeTime } = mergeIntervals(sorted);
  const freeSlots = findFreeSlots(mergedIntervals, dayStart, dayEnd);
  const utilizationRate = calculateUtilization(mergedIntervals, dayStart, dayEnd);

  return {
    result: {
      conflicts,
      freeSlots,
      mergedIntervals,
      utilizationRate,
    },
    metrics: { sortTime, conflictDetectTime, mergeTime },
  };
}

/**
 * 格式化时间
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 格式化时长
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}
