'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONFIG } from '../constants';
import { formatTime } from '../services/interval.api';
import type { Meeting, MergedInterval } from '../types';

interface TimelineViewProps {
  meetings: Meeting[];
  mergedIntervals: MergedInterval[];
  selectedRoom?: string;
}

/**
 * 时间轴视图组件 - 甘特图式展示
 */
export function TimelineView({ meetings, mergedIntervals, selectedRoom }: TimelineViewProps) {
  const { dayStart, dayEnd, workHours } = useMemo(() => {
    const today = new Date();
    today.setHours(CONFIG.WORK_START_HOUR, 0, 0, 0);
    const start = today.getTime();
    today.setHours(CONFIG.WORK_END_HOUR, 0, 0, 0);
    const end = today.getTime();
    return {
      dayStart: start,
      dayEnd: end,
      workHours: CONFIG.WORK_END_HOUR - CONFIG.WORK_START_HOUR,
    };
  }, []);

  const displayMeetings = useMemo(() => {
    return selectedRoom
      ? meetings.filter((m) => m.roomId === selectedRoom && m.status !== 'cancelled')
      : meetings.filter((m) => m.status !== 'cancelled');
  }, [meetings, selectedRoom]);

  const timeToPercent = (time: number) => {
    return ((time - dayStart) / (dayEnd - dayStart)) * 100;
  };

  const priorityColors = {
    high: 'bg-red-500/80 border-red-400',
    normal: 'bg-cyan-500/80 border-cyan-400',
    low: 'bg-slate-500/80 border-slate-400',
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">今日日程</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 时间刻度 */}
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          {Array.from({ length: workHours + 1 }, (_, i) => (
            <span key={i}>{CONFIG.WORK_START_HOUR + i}:00</span>
          ))}
        </div>

        {/* 时间轴背景 */}
        <div className="relative h-[300px] bg-slate-800/50 rounded-lg overflow-hidden">
          {/* 时间网格线 */}
          {Array.from({ length: workHours }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-slate-700"
              style={{ left: `${(i / workHours) * 100}%` }}
            />
          ))}

          {/* 合并区间（背景） */}
          {mergedIntervals.map((interval, idx) => (
            <div
              key={`merged-${idx}`}
              className="absolute top-0 bottom-0 bg-purple-500/10 border-l-2 border-r-2 border-purple-500/30"
              style={{
                left: `${timeToPercent(interval.start)}%`,
                width: `${timeToPercent(interval.end) - timeToPercent(interval.start)}%`,
              }}
            />
          ))}

          {/* 会议块 */}
          {displayMeetings.slice(0, 15).map((meeting, idx) => {
            const left = timeToPercent(meeting.startTime);
            const width = timeToPercent(meeting.endTime) - left;
            const top = (idx % 5) * 55 + 10;

            return (
              <div
                key={meeting.id}
                className={`absolute h-12 rounded border-l-4 px-2 py-1 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${priorityColors[meeting.priority]}`}
                style={{
                  left: `${Math.max(0, left)}%`,
                  width: `${Math.min(100 - left, width)}%`,
                  top: `${top}px`,
                }}
                title={`${meeting.title}\n${formatTime(meeting.startTime)} - ${formatTime(meeting.endTime)}\n${meeting.organizer}`}
              >
                <div className="text-xs font-medium text-white truncate">{meeting.title}</div>
                <div className="text-xs text-white/70 truncate">
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </div>
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>高优先级</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-cyan-500" />
            <span>普通</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-500" />
            <span>低优先级</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500/30" />
            <span>合并区间</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
