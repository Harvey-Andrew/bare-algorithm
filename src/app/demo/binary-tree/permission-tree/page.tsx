'use client';

import { useCallback, useState } from 'react';
import { Check, FolderTree, Minus } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface PermNode {
  id: string;
  name: string;
  checked: boolean;
  children: PermNode[];
}

const INITIAL_TREE: PermNode = {
  id: 'root',
  name: '全部权限',
  checked: false,
  children: [
    {
      id: 'user',
      name: '用户管理',
      checked: false,
      children: [
        { id: 'user-view', name: '查看用户', checked: false, children: [] },
        { id: 'user-edit', name: '编辑用户', checked: false, children: [] },
      ],
    },
    {
      id: 'order',
      name: '订单管理',
      checked: false,
      children: [
        { id: 'order-view', name: '查看订单', checked: false, children: [] },
        { id: 'order-edit', name: '编辑订单', checked: false, children: [] },
      ],
    },
  ],
};

function cloneTree(node: PermNode): PermNode {
  return { ...node, children: node.children.map(cloneTree) };
}

function setCheckedRecursive(node: PermNode, checked: boolean): void {
  node.checked = checked;
  node.children.forEach((c) => setCheckedRecursive(c, checked));
}

function updateParentState(node: PermNode): boolean {
  if (node.children.length === 0) return node.checked;
  const childStates = node.children.map((c) => updateParentState(c));
  node.checked = childStates.every(Boolean);
  return node.checked;
}

function PermNodeView({ node, onToggle }: { node: PermNode; onToggle: (id: string) => void }) {
  const hasCheckedChild = node.children.some(
    (c) => c.checked || c.children.some((cc) => cc.checked)
  );
  const isIndeterminate = !node.checked && hasCheckedChild;
  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-1">
        <button
          onClick={() => onToggle(node.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer
            ${node.checked ? 'bg-emerald-500 border-emerald-500' : isIndeterminate ? 'bg-amber-500/50 border-amber-500' : 'border-slate-500'}`}
        >
          {node.checked ? (
            <Check className="w-3 h-3 text-black" />
          ) : isIndeterminate ? (
            <Minus className="w-3 h-3 text-black" />
          ) : null}
        </button>
        <span>{node.name}</span>
      </div>
      {node.children.map((c) => (
        <PermNodeView key={c.id} node={c} onToggle={onToggle} />
      ))}
    </div>
  );
}

export default function PermissionTreeDemo() {
  const [tree, setTree] = useState<PermNode>(() => cloneTree(INITIAL_TREE));

  const handleToggle = useCallback((id: string) => {
    setTree((prev) => {
      const newTree = cloneTree(prev);
      function findAndToggle(node: PermNode): boolean {
        if (node.id === id) {
          setCheckedRecursive(node, !node.checked);
          return true;
        }
        return node.children.some(findAndToggle);
      }
      findAndToggle(newTree);
      updateParentState(newTree);
      return newTree;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FolderTree className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">权限树/目录树</h1>
                <p className="text-sm text-slate-400">级联选择演示</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-md">
          <h3 className="font-semibold mb-4">权限配置</h3>
          <PermNodeView node={tree} onToggle={handleToggle} />
        </div>
      </main>
    </div>
  );
}
