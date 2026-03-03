'use client';

import { useCallback, useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface FormField {
  id: string;
  label: string;
  value: string;
  children: FormField[];
}

const INITIAL_SCHEMA: FormField = {
  id: 'root',
  label: '表单',
  value: '',
  children: [
    {
      id: 'country',
      label: '国家',
      value: '中国',
      children: [
        {
          id: 'province',
          label: '省份',
          value: '广东',
          children: [{ id: 'city', label: '城市', value: '深圳', children: [] }],
        },
      ],
    },
    {
      id: 'category',
      label: '分类',
      value: '电子',
      children: [{ id: 'subcategory', label: '子分类', value: '手机', children: [] }],
    },
  ],
};

function cloneSchema(node: FormField): FormField {
  return { ...node, children: node.children.map(cloneSchema) };
}

function FieldView({
  node,
  depth,
  onChange,
}: {
  node: FormField;
  depth: number;
  onChange: (id: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-2">
        {node.children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="cursor-pointer">
            <ChevronRight
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        <label className="text-slate-400 w-20">{node.label}</label>
        <input
          value={node.value}
          onChange={(e) => onChange(node.id, e.target.value)}
          className="px-3 py-1 bg-slate-700 rounded border border-slate-600 flex-1"
        />
      </div>
      {expanded &&
        node.children.map((c) => (
          <FieldView key={c.id} node={c} depth={depth + 1} onChange={onChange} />
        ))}
    </div>
  );
}

export default function TreeFormSchemaDemo() {
  const [schema, setSchema] = useState<FormField>(() => cloneSchema(INITIAL_SCHEMA));

  const handleChange = useCallback((id: string, value: string) => {
    setSchema((prev) => {
      const clone = cloneSchema(prev);
      function findAndUpdate(node: FormField): boolean {
        if (node.id === id) {
          node.value = value;
          return true;
        }
        return node.children.some(findAndUpdate);
      }
      findAndUpdate(clone);
      return clone;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <FileText className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">树形表单联动</h1>
                <p className="text-sm text-slate-400">字段依赖关系</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-lg">
          <h3 className="font-semibold mb-4">联动表单</h3>
          {schema.children.map((c) => (
            <FieldView key={c.id} node={c} depth={0} onChange={handleChange} />
          ))}
        </div>
      </main>
    </div>
  );
}
