import type { Message, VirtualListConfig } from './types';

/**
 * 随机昵称库
 */
const NICKNAMES = [
  '小明',
  '小红',
  '张三',
  '李四',
  '王五',
  '赵六',
  '阿强',
  '小美',
  '大壮',
  '小花',
  '老王',
  '小李',
];

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
];

/**
 * 消息内容模板
 */
const MESSAGE_TEMPLATES = [
  '今天天气真好！',
  '晚上一起吃饭吗？',
  '这个项目进展如何？',
  '周末有什么计划？',
  '刚看完一部电影，强烈推荐！',
  '最近工作太忙了...',
  '有空来我这边玩！',
  '收到，马上处理。',
  '好的，没问题！',
  '稍等，我确认一下。',
  '这个方案不错，继续推进吧。',
  '明天上午开会，别忘了。',
  '文档已经发到你邮箱了。',
  '这个 bug 修复了吗？',
  '代码已经提交，帮忙 review 一下。',
];

/**
 * 生成模拟消息数据
 */
export function generateMockMessages(count: number = 100000): Message[] {
  const messages: Message[] = [];
  const baseTime = Date.now();

  for (let i = 0; i < count; i++) {
    const senderId = `user_${Math.floor(Math.random() * 100)}`;
    const senderIndex = parseInt(senderId.split('_')[1]) % NICKNAMES.length;
    const isSystem = Math.random() < 0.02; // 2% 系统消息

    messages.push({
      id: `msg_${String(i + 1).padStart(8, '0')}`,
      senderId,
      senderName: isSystem ? '系统' : NICKNAMES[senderIndex],
      avatar: isSystem ? 'bg-slate-500' : AVATAR_COLORS[senderIndex % AVATAR_COLORS.length],
      content: isSystem
        ? `--- ${['用户加入群聊', '用户退出群聊', '群名称已更新'][Math.floor(Math.random() * 3)]} ---`
        : MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)],
      timestamp: baseTime - (count - i) * 60000 + Math.floor(Math.random() * 30000),
      type: isSystem ? 'system' : 'text',
      isRead: Math.random() > 0.1, // 90% 已读
    });
  }

  return messages;
}

/**
 * 默认虚拟列表配置
 */
export const DEFAULT_CONFIG: VirtualListConfig = {
  itemHeight: 72,
  overscan: 5,
};

/**
 * 性能配置
 */
export const PERFORMANCE_CONFIG = {
  /** 默认数据量 */
  DEFAULT_COUNT: 100000,
  /** 滚动节流间隔（ms） */
  THROTTLE_MS: 16,
  /** 长任务阈值 */
  LONG_TASK_THRESHOLD: 16,
};
