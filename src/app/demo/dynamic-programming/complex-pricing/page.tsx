'use client';

import { useMemo, useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Coupon {
  id: string;
  name: string;
  discount: number;
  minPrice: number;
}

const COUPONS: Coupon[] = [
  { id: 'c1', name: '满100减10', discount: 10, minPrice: 100 },
  { id: 'c2', name: '满200减30', discount: 30, minPrice: 200 },
  { id: 'c3', name: '满300减60', discount: 60, minPrice: 300 },
  { id: 'c4', name: '会员专享15', discount: 15, minPrice: 0 },
];

function findBestCombination(
  total: number,
  coupons: Coupon[],
  selected: string[]
): { discount: number; ids: string[] } {
  const usable = coupons.filter((c) => total >= c.minPrice && selected.includes(c.id));
  if (usable.length === 0) return { discount: 0, ids: [] };

  // 简化: 贪心选择最大折扣
  let best = { discount: 0, ids: [] as string[] };
  for (let mask = 1; mask < 1 << usable.length; mask++) {
    const picked = usable.filter((_, i) => (mask & (1 << i)) !== 0);
    const totalDiscount = picked.reduce((s, c) => s + c.discount, 0);
    if (totalDiscount > best.discount) {
      best = { discount: totalDiscount, ids: picked.map((c) => c.id) };
    }
  }
  return best;
}

export default function ComplexPricingDemo() {
  const [originalPrice] = useState(350);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>(['c1', 'c2', 'c4']);

  const toggle = (id: string) =>
    setSelectedCoupons((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const best = useMemo(
    () => findBestCombination(originalPrice, COUPONS, selectedCoupons),
    [originalPrice, selectedCoupons]
  );
  const finalPrice = originalPrice - best.discount;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/dynamic-programming" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">复杂表单报价</h1>
                <p className="text-sm text-slate-400">背包问题优惠组合</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">可用优惠券</h3>
            <div className="space-y-2">
              {COUPONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                    ${selectedCoupons.includes(c.id) ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700'}
                    ${originalPrice < c.minPrice ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-emerald-400">-¥{c.discount}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">商品总价</span>
                <span>¥{originalPrice}</span>
              </div>
              <div className="flex justify-between mb-2 text-emerald-400">
                <span>最优优惠</span>
                <span>-¥{best.discount}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between text-xl font-bold">
                <span>实付</span>
                <span className="text-emerald-400">¥{finalPrice}</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h4 className="font-semibold mb-2">使用的优惠券</h4>
              <div className="text-sm text-slate-300">
                {best.ids.length > 0
                  ? best.ids.map((id) => COUPONS.find((c) => c.id === id)?.name).join(' + ')
                  : '无'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
