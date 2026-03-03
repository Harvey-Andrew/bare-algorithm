export interface OptimizationResult {
  optimalValue: number;
  iterations: number;
  history: Array<{ value: number; result: number; feasible: boolean }>;
}
