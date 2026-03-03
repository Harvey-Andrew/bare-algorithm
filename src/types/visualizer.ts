import type { ReactNode, RefObject } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { BaseFrame } from './algorithm';

// 算法模式配置
export interface ModeConfig {
  value: string;
  label: string;
  icon?: LucideIcon;
  activeColorClass?: string;
}

// 图例项
export interface LegendItem {
  colorBg: string;
  label: string;
}

// 可视化渲染属性
export interface VisualizerRenderProps<TFrame extends BaseFrame> {
  currentFrame: TFrame;
  currentStep: number;
  isPlaying: boolean;
  currentMode?: string;
  onCellClick?: (row: number, col: number) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

// 代码面板渲染属性
export interface CodePanelRenderProps<TFrame extends BaseFrame> {
  currentFrame: TFrame;
  currentMode: string;
}

// Backward-compatible renderer props used by older problem pages that share one prop type
// between visualizer and code panel renderers.
export interface AlgorithmRendererProps<TFrame extends BaseFrame> {
  currentFrame: TFrame;
  currentMode?: string;
  currentStep?: number;
  isPlaying?: boolean;
  onCellClick?: (row: number, col: number) => void;
  containerRef?: RefObject<HTMLDivElement | null>;
}

// 算法配置接口
export interface AlgorithmConfig<TInput = unknown, TFrame extends BaseFrame = BaseFrame> {
  id: string;
  title: string;
  externalLinks: string;
  modes: ModeConfig[];
  defaultMode: string;
  defaultInput: TInput;
  generateFrames: (input: TInput, mode: string) => TFrame[];
  parseInput: (input: string) => TInput | null;
  formatInput: (input: TInput) => string;
  generateRandomInput: () => TInput;
  RendererVisualizer: (props: VisualizerRenderProps<TFrame>) => ReactNode;
  legend: LegendItem[] | ((mode: string) => LegendItem[]);
  renderCodePanel: (props: CodePanelRenderProps<TFrame>) => ReactNode;
  hideSolution?: boolean; // 是否隐藏题解按钮
}
