'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PAGE_SIZE_OPTIONS } from '../constants';
import type { PaginationConfig } from '../types';

interface PaginationProps {
  total: number;
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * 分页控制组件
 */
export function Pagination({ total, pagination, onPageChange, onPageSizeChange }: PaginationProps) {
  const { page, pageSize } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800">
      {/* 左侧：数据统计 */}
      <div className="text-sm text-slate-400">
        显示 <span className="text-white">{start}</span> - <span className="text-white">{end}</span>{' '}
        条，共 <span className="text-white">{total.toLocaleString()}</span> 条
      </div>

      {/* 右侧：分页控制 */}
      <div className="flex items-center gap-4">
        {/* 每页数量 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">每页</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-400">条</span>
        </div>

        {/* 页码控制 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="px-3 text-sm text-slate-300">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
