'use client';

import { useCallback, useState } from 'react';
import { ChevronRight, Folder, Loader2 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface TreeNode {
  id: string;
  name: string;
  loaded: boolean;
  loading: boolean;
  children: TreeNode[];
}

const MOCK_CHILDREN: Record<string, string[]> = {
  root: ['文档', '图片', '视频'],
  文档: ['工作', '个人'],
  图片: ['截图', '照片'],
  工作: ['报告.docx', '计划.xlsx'],
};

export default function TreeViewLazyLoadDemo() {
  const [tree, setTree] = useState<TreeNode>({
    id: 'root',
    name: '根目录',
    loaded: true,
    loading: false,
    children: (MOCK_CHILDREN['root'] || []).map((n) => ({
      id: n,
      name: n,
      loaded: false,
      loading: false,
      children: [],
    })),
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));

  const loadChildren = useCallback(async (nodeId: string) => {
    setTree((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as TreeNode;
      function find(n: TreeNode): TreeNode | null {
        if (n.id === nodeId) return n;
        for (const c of n.children) {
          const f = find(c);
          if (f) return f;
        }
        return null;
      }
      const node = find(clone);
      if (node) node.loading = true;
      return clone;
    });

    await new Promise((r) => setTimeout(r, 500));

    setTree((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as TreeNode;
      function find(n: TreeNode): TreeNode | null {
        if (n.id === nodeId) return n;
        for (const c of n.children) {
          const f = find(c);
          if (f) return f;
        }
        return null;
      }
      const node = find(clone);
      if (node) {
        node.loading = false;
        node.loaded = true;
        node.children = (MOCK_CHILDREN[nodeId] || []).map((n) => ({
          id: n,
          name: n,
          loaded: false,
          loading: false,
          children: [],
        }));
      }
      return clone;
    });
  }, []);

  const handleExpand = useCallback(
    (nodeId: string, node: TreeNode) => {
      if (!node.loaded && !node.loading) loadChildren(nodeId);
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    },
    [loadChildren]
  );

  function renderNode(node: TreeNode, depth = 0) {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0 || !node.loaded;
    return (
      <div key={node.id} style={{ marginLeft: depth * 16 }}>
        <div
          className="flex items-center gap-2 py-1 hover:bg-slate-700/50 rounded cursor-pointer"
          onClick={() => handleExpand(node.id, node)}
        >
          {hasChildren &&
            (node.loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            ))}
          <Folder className="w-4 h-4 text-amber-400" />
          <span>{node.name}</span>
        </div>
        {isExpanded && node.children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Folder className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TreeView 懒加载</h1>
                <p className="text-sm text-slate-400">按需加载子节点</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-md">
          {renderNode(tree)}
        </div>
      </main>
    </div>
  );
}
