import type { Metadata } from 'next';

import { BackButton } from '@/components/shared/BackButton';
import { CategoryCard } from '@/components/shared/CategoryCard';
import problemsData from '@/lib/problems/categories.json';
import type { CategoryMeta } from '@/types/problem';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: '算法分类',
  description: '浏览算法题目的分类，选择你感兴趣的领域开始探索。',
};

export default function ProblemsPage() {
  const categories = problemsData as unknown as CategoryMeta[];

  return (
    <div className="container mx-auto px-4 py-3.5 sm:py-4.5">
      <div className="mb-2 flex items-start gap-3 sm:mb-6 sm:gap-4">
        <div className="hidden pt-1 sm:block sm:pt-0">
          <BackButton
            fallbackHref="/"
            strict
            className="inline-flex cursor-pointer rounded-xl border border-slate-700 bg-slate-800/50 p-2.5 transition-colors hover:border-blue-500/50"
          />
        </div>
        <div className="flex-1">
          <h1 className="mb-2.5 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">算法分类</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">
            请选择一个算法分类，开启你的可视化学习之旅。
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
