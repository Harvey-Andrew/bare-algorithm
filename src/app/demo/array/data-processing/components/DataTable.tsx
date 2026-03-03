'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import type { Product, SortConfig } from '../types';

interface DataTableProps {
  data: Product[];
  sort: SortConfig;
  onSort: (field: keyof Product) => void;
}

/**
 * 可排序数据表格组件
 */
export function DataTable({ data, sort, onSort }: DataTableProps) {
  const columns: { key: keyof Product; label: string; width: string }[] = [
    { key: 'sku', label: 'SKU', width: 'w-32' },
    { key: 'name', label: '商品名称', width: 'w-48' },
    { key: 'category', label: '类目', width: 'w-24' },
    { key: 'price', label: '价格', width: 'w-24' },
    { key: 'stock', label: '库存', width: 'w-20' },
    { key: 'sales', label: '销量', width: 'w-20' },
    { key: 'status', label: '状态', width: 'w-20' },
  ];

  const formatPrice = (price: number) => {
    if (price <= 0) return <span className="text-red-400">¥{(price / 100).toFixed(2)}</span>;
    return `¥${(price / 100).toFixed(2)}`;
  };

  const formatStatus = (status: Product['status']) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-yellow-500/20 text-yellow-400',
      deleted: 'bg-red-500/20 text-red-400',
    };
    const labels = { active: '上架中', inactive: '已下架', deleted: '已删除' };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${styles[status]}`}>{labels[status]}</span>
    );
  };

  const SortIcon = ({ field }: { field: keyof Product }) => {
    if (sort.field !== field) return null;
    return sort.order === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 inline" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${col.width} px-3 py-2 text-left text-slate-400 font-medium cursor-pointer hover:text-white transition-colors`}
                onClick={() => onSort(col.key)}
              >
                {col.label}
                <SortIcon field={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr
              key={product.id}
              className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-xs text-slate-400">{product.sku}</td>
              <td className="px-3 py-2 text-white truncate max-w-[200px]">{product.name}</td>
              <td className="px-3 py-2 text-slate-300">{product.category}</td>
              <td className="px-3 py-2 text-right">{formatPrice(product.price)}</td>
              <td
                className={`px-3 py-2 text-right ${product.stock < 0 ? 'text-red-400' : 'text-slate-300'}`}
              >
                {product.stock}
              </td>
              <td className="px-3 py-2 text-right text-cyan-400">{product.sales}</td>
              <td className="px-3 py-2">{formatStatus(product.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && <div className="text-center py-8 text-slate-500">暂无数据</div>}
    </div>
  );
}
