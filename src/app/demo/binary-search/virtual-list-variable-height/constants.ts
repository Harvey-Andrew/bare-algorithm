export const ITEM_COUNT = 1000;
export const VIEWPORT_HEIGHT = 400;
export const BUFFER_SIZE = 5;

// 生成随机高度的数据
export function generateItems(
  count: number
): Array<{ id: number; content: string; height: number }> {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    content: `Item ${i + 1} - ${Math.random().toString(36).slice(2, 8)}`,
    height: 40 + Math.floor(Math.random() * 80), // 40-120px
  }));
}
