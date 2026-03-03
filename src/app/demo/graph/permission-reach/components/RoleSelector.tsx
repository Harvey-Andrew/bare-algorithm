'use client';

import { User } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Role } from '../types';

interface RoleSelectorProps {
  roles: Role[];
  currentRole: string;
  onRoleChange: (roleId: string) => void;
}

/**
 * 角色选择器组件
 */
export function RoleSelector({ roles, currentRole, onRoleChange }: RoleSelectorProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5" /> 用户角色
        </CardTitle>
        <CardDescription>选择当前用户角色</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((r) => (
          <div
            key={r.id}
            onClick={() => onRoleChange(r.id)}
            className={`p-3 rounded cursor-pointer transition-all ${
              currentRole === r.id
                ? 'bg-green-500/20 border border-green-500/50'
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-slate-400 mt-1">权限：{r.permissions.join(', ')}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
