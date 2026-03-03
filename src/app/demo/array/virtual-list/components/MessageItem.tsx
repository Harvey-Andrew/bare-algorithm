'use client';

import { formatMessageTime } from '../services/virtualScroll.api';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
  height: number;
  index: number;
}

/**
 * 消息列表项组件
 */
export function MessageItem({ message, height, index }: MessageItemProps) {
  // 系统消息样式
  if (message.type === 'system') {
    return (
      <div className="flex items-center justify-center px-4" style={{ height: `${height}px` }}>
        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-2 hover:bg-slate-800/30 transition-colors"
      style={{ height: `${height}px` }}
    >
      {/* 头像 */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${message.avatar}`}
      >
        {message.senderName.slice(0, 1)}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-white truncate">{message.senderName}</span>
          <span className="text-xs text-slate-500">{formatMessageTime(message.timestamp)}</span>
          {!message.isRead && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
        </div>
        <p className="text-sm text-slate-300 truncate mt-0.5">{message.content}</p>
      </div>

      {/* 索引（调试用） */}
      <div className="text-xs text-slate-600 font-mono">#{index}</div>
    </div>
  );
}
