import type { HistoryPage } from './types';

export const INITIAL_PAGES: HistoryPage[] = [
  { id: '1', url: 'https://google.com', title: 'Google' },
  { id: '2', url: 'https://github.com', title: 'GitHub' },
  { id: '3', url: 'https://leetcode.cn', title: 'LeetCode' },
];

export const AVAILABLE_PAGES: HistoryPage[] = [
  { id: 'a', url: 'https://react.dev', title: 'React' },
  { id: 'b', url: 'https://nextjs.org', title: 'Next.js' },
  { id: 'c', url: 'https://tailwindcss.com', title: 'Tailwind' },
  { id: 'd', url: 'https://typescript-lang.org', title: 'TypeScript' },
];
