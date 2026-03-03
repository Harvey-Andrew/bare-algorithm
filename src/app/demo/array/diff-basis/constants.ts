import type { Item } from './types';

const NAMES = ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '芒果', '荔枝', '菠萝', '樱桃'];

export function generateMockList(count: number = 10): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    name: NAMES[i % NAMES.length],
  }));
}

export function generateModifiedList(original: Item[]): Item[] {
  const modified = [...original];
  // 移除一些
  const removeCount = Math.floor(original.length * 0.3);
  for (let i = 0; i < removeCount; i++) {
    const idx = Math.floor(Math.random() * modified.length);
    modified.splice(idx, 1);
  }
  // 添加一些新的
  const addCount = Math.floor(original.length * 0.3);
  for (let i = 0; i < addCount; i++) {
    modified.push({
      id: `new-${Date.now()}-${i}`,
      name: `新${NAMES[i % NAMES.length]}`,
    });
  }
  return modified;
}

export const CONFIG = {
  DEFAULT_COUNT: 10,
};
