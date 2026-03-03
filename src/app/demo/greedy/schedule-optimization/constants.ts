import type { Meeting } from './types';

export const MOCK_MEETINGS: Meeting[] = [
  { id: 'm1', name: '晨会', start: 9, end: 10 },
  { id: 'm2', name: '产品评审', start: 9.5, end: 11 },
  { id: 'm3', name: '技术同步', start: 10, end: 11 },
  { id: 'm4', name: '午餐会', start: 12, end: 13 },
  { id: 'm5', name: '代码Review', start: 13, end: 14 },
  { id: 'm6', name: '需求讨论', start: 13.5, end: 15 },
  { id: 'm7', name: '1on1', start: 15, end: 16 },
  { id: 'm8', name: '周报', start: 16, end: 17 },
];
