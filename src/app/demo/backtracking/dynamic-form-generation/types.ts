export interface FormField {
  id: string;
  label: string;
  options: string[];
  constraints?: Record<string, string[]>; // 当选择某值时，可选的其他字段值
}

export interface FormCombination {
  id: string;
  values: Record<string, string>;
}
