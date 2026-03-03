'use client';

import { FileText, RotateCcw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useDynamicForm } from './hooks/useDynamicForm';

export default function DynamicFormGenerationDemo() {
  const { fields, selectedValues, validCombinations, selectValue, getAvailableOptions, reset } =
    useDynamicForm();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/backtracking" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">动态表单候选生成</h1>
                <p className="text-sm text-slate-400">回溯算法生成合法填写组合</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 表单 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">动态表单</h3>
              <button
                onClick={reset}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg
                  transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6">
              {fields.map((field) => {
                const availableOptions = getAvailableOptions(field.id);
                return (
                  <div key={field.id}>
                    <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((opt) => {
                        const isAvailable = availableOptions.includes(opt);
                        const isSelected = selectedValues[field.id] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => isAvailable && selectValue(field.id, opt)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer
                              ${isSelected ? 'bg-emerald-500 text-black' : isAvailable ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">约束规则</div>
              <div className="text-xs text-slate-500">南方 + 冬季 → 禁止户外活动</div>
            </div>
          </div>

          {/* 所有合法组合 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">所有合法组合</h3>
              <span className="text-sm text-slate-400">{validCombinations.length} 个</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {validCombinations.map((combo) => (
                <div key={combo.id} className="p-3 bg-slate-700/50 rounded-lg flex gap-2 flex-wrap">
                  {Object.entries(combo.values).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
