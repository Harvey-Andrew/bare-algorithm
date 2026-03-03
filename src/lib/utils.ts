import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function matchMode<T>(mode: string, map: Record<string, T>): T {
  const value = map[mode];
  // 如果找不到对应模式，返回 map 中第一个 key 对应的值作为 fallback，或者抛出错误
  // 这里选择返回 map 的第一个值，增强容错性
  if (value === undefined) {
    const defaultKey = Object.keys(map)[0];
    if (defaultKey) return map[defaultKey];
    throw new Error(`Invalid mode: ${mode}`);
  }
  return value;
}
