export interface FlowNode {
  id: string;
  name: string;
  dependencies: string[];
}

export interface ExecutionPath {
  id: string;
  sequence: string[];
}
