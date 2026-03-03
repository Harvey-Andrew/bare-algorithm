import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '朴素算法',
    short_name: '朴素算法',
    description: '通过交互式动画直观理解算法逻辑，覆盖 200+ LeetCode 题目的可视化解题',
    start_url: '/',
    display: 'standalone',
    background_color: '#020817',
    theme_color: '#6366f1',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'utilities'],
    lang: 'zh-CN',
  };
}
