'use client';

import { useState } from 'react';
import { Code } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const SAMPLE_AST = {
  type: 'Program',
  children: [
    {
      type: 'FunctionDeclaration',
      name: 'hello',
      children: [
        { type: 'Identifier', name: 'name', children: [] },
        {
          type: 'BlockStatement',
          children: [
            {
              type: 'ReturnStatement',
              children: [{ type: 'BinaryExpression', operator: '+', children: [] }],
            },
          ],
        },
      ],
    },
  ],
};

interface ASTNode {
  type: string;
  name?: string;
  operator?: string;
  children: ASTNode[];
}

function ASTNodeView({ node, depth = 0 }: { node: ASTNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-1 hover:bg-slate-700/50 rounded cursor-pointer"
      >
        {node.children.length > 0 && <span className="text-slate-500">{expanded ? '▼' : '▶'}</span>}
        <span className="text-purple-400">{node.type}</span>
        {node.name && <span className="text-emerald-400">: {node.name}</span>}
        {node.operator && <span className="text-amber-400">({node.operator})</span>}
      </div>
      {expanded && node.children.map((c, i) => <ASTNodeView key={i} node={c} depth={depth + 1} />)}
    </div>
  );
}

export default function AstAnalysisDemo() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AST 代码分析</h1>
                <p className="text-sm text-slate-400">抽象语法树遍历</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-4">AST 结构</h3>
          <ASTNodeView node={SAMPLE_AST} />
        </div>
      </main>
    </div>
  );
}
