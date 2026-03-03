'use client';

import { useCallback, useMemo, useState } from 'react';

import { generateMockMeetings, ROOMS } from '../constants';
import { analyzeMeetings } from '../services/interval.api';
import type { Meeting, PerformanceMetrics } from '../types';

/**
 * 日历状态管理 Hook
 */
export function useCalendar() {
  // 原始数据（懒初始化）
  const [meetings, setMeetings] = useState<Meeting[]>(() => generateMockMeetings());

  // 选中的会议室
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(undefined);

  // 分析结果
  const { result, metrics } = useMemo(() => {
    return analyzeMeetings(meetings, selectedRoom);
  }, [meetings, selectedRoom]);

  // 性能指标
  const performanceMetrics: PerformanceMetrics = useMemo(
    () => ({
      sortTime: metrics.sortTime,
      conflictDetectTime: metrics.conflictDetectTime,
      mergeTime: metrics.mergeTime,
      totalMeetings: selectedRoom
        ? meetings.filter((m) => m.roomId === selectedRoom).length
        : meetings.length,
    }),
    [metrics, meetings, selectedRoom]
  );

  /**
   * 添加会议
   */
  const addMeeting = useCallback((meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: `meeting-new-${Date.now()}`,
    };
    setMeetings((prev) => [...prev, newMeeting]);
  }, []);

  /**
   * 切换会议室筛选
   */
  const filterByRoom = useCallback((roomId: string | undefined) => {
    setSelectedRoom(roomId);
  }, []);

  /**
   * 重新生成数据
   */
  const regenerateData = useCallback(() => {
    setMeetings(generateMockMeetings());
  }, []);

  return {
    // 数据
    meetings,
    rooms: ROOMS,
    result,
    metrics: performanceMetrics,

    // 配置
    selectedRoom,

    // 操作
    addMeeting,
    filterByRoom,
    regenerateData,
  };
}
