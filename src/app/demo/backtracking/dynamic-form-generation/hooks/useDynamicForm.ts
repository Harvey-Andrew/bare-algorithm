'use client';

import { useCallback, useMemo, useState } from 'react';

import { CONSTRAINTS, DEFAULT_FIELDS } from '../constants';
import type { FormCombination, FormField } from '../types';

function isValid(current: Record<string, string>): boolean {
  for (const rule of CONSTRAINTS) {
    const conditionMet = Object.entries(rule.condition).every(([k, v]) => current[k] === v);
    if (conditionMet) {
      const forbidden = Object.entries(rule.forbidden).some(([k, v]) => current[k] === v);
      if (forbidden) return false;
    }
  }
  return true;
}

function generateValidCombinations(fields: FormField[]): FormCombination[] {
  const results: FormCombination[] = [];
  const current: Record<string, string> = {};

  function backtrack(fieldIdx: number) {
    if (fieldIdx === fields.length) {
      if (isValid(current)) {
        results.push({ id: `combo-${results.length}`, values: { ...current } });
      }
      return;
    }

    const field = fields[fieldIdx];
    for (const option of field.options) {
      current[field.id] = option;
      if (isValid(current)) {
        // 剪枝
        backtrack(fieldIdx + 1);
      }
    }
    delete current[field.id];
  }

  backtrack(0);
  return results;
}

export function useDynamicForm() {
  const [fields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const validCombinations = useMemo(() => generateValidCombinations(fields), [fields]);

  const selectValue = useCallback((fieldId: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const getAvailableOptions = useCallback(
    (fieldId: string): string[] => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return [];

      return field.options.filter((opt) => {
        const testValues = { ...selectedValues, [fieldId]: opt };
        return isValid(testValues);
      });
    },
    [fields, selectedValues]
  );

  const reset = useCallback(() => setSelectedValues({}), []);

  return { fields, selectedValues, validCombinations, selectValue, getAvailableOptions, reset };
}
