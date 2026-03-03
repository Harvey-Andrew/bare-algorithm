import type { FormField } from './types';

export const DEFAULT_FIELDS: FormField[] = [
  { id: 'region', label: '地区', options: ['北方', '南方'] },
  { id: 'season', label: '季节', options: ['春', '夏', '秋', '冬'] },
  { id: 'activity', label: '活动', options: ['室内', '户外'] },
];

// 约束：南方冬天没有户外活动
export const CONSTRAINTS: Array<{
  condition: Record<string, string>;
  forbidden: Record<string, string>;
}> = [{ condition: { region: '南方', season: '冬' }, forbidden: { activity: '户外' } }];
