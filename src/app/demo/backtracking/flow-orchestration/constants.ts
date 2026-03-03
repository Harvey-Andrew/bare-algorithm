import type { FlowNode } from './types';

export const DEFAULT_NODES: FlowNode[] = [
  { id: 'A', name: '数据采集', dependencies: [] },
  { id: 'B', name: '数据清洗', dependencies: ['A'] },
  { id: 'C', name: '特征提取', dependencies: ['B'] },
  { id: 'D', name: '模型训练', dependencies: ['C'] },
  { id: 'E', name: '模型评估', dependencies: ['D'] },
  { id: 'F', name: '日志记录', dependencies: [] },
];
