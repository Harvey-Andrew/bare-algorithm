import type { NodePosition, PageLink, PageNode, Role } from './types';

/**
 * 默认页面
 */
export const DEFAULT_PAGES: PageNode[] = [
  { id: 'home', name: '首页', requiredRole: 'guest' },
  { id: 'dashboard', name: '控制台', requiredRole: 'user' },
  { id: 'profile', name: '个人中心', requiredRole: 'user' },
  { id: 'settings', name: '系统设置', requiredRole: 'admin' },
  { id: 'users', name: '用户管理', requiredRole: 'admin' },
  { id: 'logs', name: '操作日志', requiredRole: 'admin' },
  { id: 'billing', name: '账单管理', requiredRole: 'finance' },
  { id: 'reports', name: '财务报表', requiredRole: 'finance' },
];

/**
 * 页面跳转关系
 */
export const PAGE_LINKS: PageLink[] = [
  { from: 'home', to: 'dashboard' },
  { from: 'dashboard', to: 'profile' },
  { from: 'dashboard', to: 'settings' },
  { from: 'dashboard', to: 'billing' },
  { from: 'settings', to: 'users' },
  { from: 'settings', to: 'logs' },
  { from: 'billing', to: 'reports' },
];

/**
 * 默认角色
 */
export const DEFAULT_ROLES: Role[] = [
  { id: 'guest', name: '访客', permissions: ['guest'] },
  { id: 'user', name: '普通用户', permissions: ['guest', 'user'] },
  { id: 'admin', name: '管理员', permissions: ['guest', 'user', 'admin'] },
  { id: 'finance', name: '财务', permissions: ['guest', 'user', 'finance'] },
  { id: 'superadmin', name: '超级管理员', permissions: ['guest', 'user', 'admin', 'finance'] },
];

/**
 * SVG 布局常量
 */
export const SVG_CONFIG = {
  width: 700,
  height: 400,
  nodeRadius: 35,
};

/**
 * 节点位置映射
 */
export const NODE_POSITIONS: Map<string, NodePosition> = new Map([
  ['home', { x: 100, y: 200 }],
  ['dashboard', { x: 250, y: 200 }],
  ['profile', { x: 400, y: 80 }],
  ['settings', { x: 400, y: 200 }],
  ['billing', { x: 400, y: 320 }],
  ['users', { x: 550, y: 130 }],
  ['logs', { x: 550, y: 270 }],
  ['reports', { x: 550, y: 380 }],
]);
