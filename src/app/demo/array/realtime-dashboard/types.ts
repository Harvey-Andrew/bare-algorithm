'use client';

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

export interface DashboardState {
  metrics: MetricData[];
  lastUpdateTime: number;
  isLive: boolean;
}

export interface PerformanceMetrics {
  updateCount: number;
  avgUpdateTime: number;
}
