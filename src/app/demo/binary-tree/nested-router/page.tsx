'use client';

import { useState } from 'react';
import { ChevronRight, Home, Route } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface RouteNode {
  path: string;
  name: string;
  children: RouteNode[];
}

const ROUTES: RouteNode = {
  path: '/',
  name: '首页',
  children: [
    {
      path: '/dashboard',
      name: '仪表盘',
      children: [
        { path: '/dashboard/analytics', name: '数据分析', children: [] },
        { path: '/dashboard/reports', name: '报表', children: [] },
      ],
    },
    {
      path: '/users',
      name: '用户管理',
      children: [
        { path: '/users/list', name: '用户列表', children: [] },
        { path: '/users/roles', name: '角色权限', children: [] },
      ],
    },
    { path: '/settings', name: '设置', children: [] },
  ],
};

function findPath(node: RouteNode, target: string, path: RouteNode[] = []): RouteNode[] | null {
  path.push(node);
  if (node.path === target) return path;
  for (const c of node.children) {
    const result = findPath(c, target, [...path]);
    if (result) return result;
  }
  return null;
}

function RouteNodeView({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: RouteNode;
  depth: number;
  selected: string;
  onSelect: (p: string) => void;
}) {
  const isSelected = selected.startsWith(node.path);
  return (
    <div style={{ marginLeft: depth * 12 }}>
      <button
        onClick={() => onSelect(node.path)}
        className={`flex items-center gap-2 py-2 px-3 rounded w-full text-left cursor-pointer transition-colors
          ${selected === node.path ? 'bg-emerald-500/20 text-emerald-400' : isSelected ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
      >
        {node.children.length > 0 && (
          <ChevronRight className={`w-4 h-4 ${isSelected ? 'rotate-90' : ''}`} />
        )}
        <span>{node.name}</span>
      </button>
      {isSelected &&
        node.children.map((c) => (
          <RouteNodeView
            key={c.path}
            node={c}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

export default function NestedRouterDemo() {
  const [currentPath, setCurrentPath] = useState('/dashboard/analytics');
  const breadcrumb = findPath(ROUTES, currentPath) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-tree" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Route className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">嵌套路由树</h1>
                <p className="text-sm text-slate-400">路由菜单与面包屑</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Home className="w-4 h-4" />
          {breadcrumb.map((r, i) => (
            <span key={r.path} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-4 h-4 text-slate-500" />}
              <span className={i === breadcrumb.length - 1 ? 'text-emerald-400' : 'text-slate-400'}>
                {r.name}
              </span>
            </span>
          ))}
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-sm">
          <h3 className="font-semibold mb-4">导航菜单</h3>
          <RouteNodeView node={ROUTES} depth={0} selected={currentPath} onSelect={setCurrentPath} />
        </div>
      </main>
    </div>
  );
}
