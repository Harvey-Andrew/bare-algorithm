import type { DataRecord } from './types';

const NAMES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
const DOMAINS = ['qq.com', 'gmail.com', '163.com', 'hotmail.com'];
const SOURCES = ['Web 注册', 'App 注册', '导入', '手动'];

export function generateMockRecords(count: number = 1000): DataRecord[] {
  const records: DataRecord[] = [];

  for (let i = 0; i < count; i++) {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const email = `${name.toLowerCase()}${i % 100}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`;

    records.push({
      id: `rec-${i}`,
      email,
      name,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    });
  }

  // 故意添加重复
  const dupCount = Math.floor(count * 0.2);
  for (let i = 0; i < dupCount; i++) {
    const orig = records[Math.floor(Math.random() * records.length)];
    records.push({ ...orig, id: `dup-${i}`, source: '导入' });
  }

  return records;
}

export const CONFIG = { DEFAULT_COUNT: 1000 };
