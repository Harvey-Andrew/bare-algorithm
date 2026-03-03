import type { MetricData } from './types';

export function generateInitialMetrics(): MetricData[] {
  return [
    { id: 'pv', name: '页面浏览量', value: 125432, unit: '', trend: 'up', history: [] },
    { id: 'uv', name: '独立访客', value: 8234, unit: '', trend: 'up', history: [] },
    { id: 'order', name: '订单数', value: 456, unit: '', trend: 'stable', history: [] },
    { id: 'gmv', name: 'GMV', value: 234567, unit: '¥', trend: 'up', history: [] },
    { id: 'cvr', name: '转化率', value: 5.5, unit: '%', trend: 'down', history: [] },
    { id: 'aov', name: '客单价', value: 514, unit: '¥', trend: 'stable', history: [] },
  ];
}

export function updateMetrics(metrics: MetricData[]): MetricData[] {
  return metrics.map((m) => {
    const delta = (Math.random() - 0.4) * m.value * 0.05;
    const newValue = Math.max(0, m.value + delta);
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
    return {
      ...m,
      value: m.id === 'cvr' ? Math.round(newValue * 10) / 10 : Math.round(newValue),
      trend: trend as MetricData['trend'],
      history: [...m.history.slice(-19), m.value],
    };
  });
}

export const CONFIG = {
  UPDATE_INTERVAL_MS: 2000,
  MAX_HISTORY: 20,
};
