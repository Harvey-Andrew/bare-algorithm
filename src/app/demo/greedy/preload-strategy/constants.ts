import type { Resource } from './types';

export const MAX_CONCURRENT = 3;
export const BANDWIDTH_LIMIT = 100; // KB/s

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'hero-image.jpg', priority: 10, size: 200, inViewport: true },
  { id: 'r2', name: 'main.css', priority: 9, size: 50, inViewport: true },
  { id: 'r3', name: 'footer.png', priority: 2, size: 100, inViewport: false },
  { id: 'r4', name: 'analytics.js', priority: 1, size: 30, inViewport: false },
  { id: 'r5', name: 'sidebar.js', priority: 5, size: 80, inViewport: false },
  { id: 'r6', name: 'fonts.woff2', priority: 8, size: 60, inViewport: true },
];
