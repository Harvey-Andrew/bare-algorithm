'use client';

import { Database, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Entity, NewEntityInput } from '../types';

interface EntityTableProps {
  entities: Entity[];
  newEntity: NewEntityInput;
  onRemoveEntity: (id: number) => void;
  onUpdateNewEntity: (field: keyof NewEntityInput, value: string) => void;
  onAddEntity: () => void;
}

/**
 * 实体数据表格组件
 */
export function EntityTable({
  entities,
  newEntity,
  onRemoveEntity,
  onUpdateNewEntity,
  onAddEntity,
}: EntityTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          数据源
        </CardTitle>
        <CardDescription>当前共 {entities.length} 条记录</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 数据表格 */}
        <div className="max-h-[400px] overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">姓名</th>
                <th className="text-left p-2">电话</th>
                <th className="text-left p-2">地址</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entities.map((e) => (
                <tr key={e.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 text-muted-foreground">{e.id}</td>
                  <td className="p-2">{e.name}</td>
                  <td className="p-2 font-mono text-xs">{e.phone}</td>
                  <td className="p-2 text-xs truncate max-w-[150px]">{e.address}</td>
                  <td className="p-2">
                    <button
                      onClick={() => onRemoveEntity(e.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 添加新记录 */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">添加新记录</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="姓名"
              value={newEntity.name}
              onChange={(e) => onUpdateNewEntity('name', e.target.value)}
              className="px-2 py-1 text-sm bg-background border rounded"
            />
            <input
              type="text"
              placeholder="电话"
              value={newEntity.phone}
              onChange={(e) => onUpdateNewEntity('phone', e.target.value)}
              className="px-2 py-1 text-sm bg-background border rounded"
            />
            <input
              type="text"
              placeholder="地址"
              value={newEntity.address}
              onChange={(e) => onUpdateNewEntity('address', e.target.value)}
              className="px-2 py-1 text-sm bg-background border rounded"
            />
          </div>
          <Button
            onClick={onAddEntity}
            size="sm"
            className="mt-2 w-full cursor-pointer"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
