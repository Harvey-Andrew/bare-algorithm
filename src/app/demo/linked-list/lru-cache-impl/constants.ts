import type { CacheEntry } from './types';

// 默认缓存容量
export const DEFAULT_CAPACITY = 5;

// 默认初始数据
export const DEFAULT_ENTRIES: CacheEntry[] = [
  { key: 'user_1', value: '张三', accessTime: Date.now() - 5000 },
  { key: 'user_2', value: '李四', accessTime: Date.now() - 4000 },
  { key: 'user_3', value: '王五', accessTime: Date.now() - 3000 },
];

// 模拟 API 数据
export const MOCK_API_DATA: Record<string, string> = {
  user_1: '张三',
  user_2: '李四',
  user_3: '王五',
  user_4: '赵六',
  user_5: '钱七',
  user_6: '孙八',
  user_7: '周九',
  user_8: '吴十',
};
