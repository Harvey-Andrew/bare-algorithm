import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookOpen, Briefcase, GraduationCap } from 'lucide-react';

import { AlgoCard } from '@/components/shared/AlgoCard';
import { ArrayStudyRoadmap } from '@/components/shared/ArrayStudyRoadmap';
import { BackButton } from '@/components/shared/BackButton';
import { ProblemList } from '@/components/shared/ProblemList';
import problemsData from '@/lib/problems/categories.json';
import {
  getCategoryApplicationsData,
  getCategoryProblemData,
  getCategoryTheoryData,
} from '@/lib/problems/problem-catalog.generated';
import {
  buildStudyStages,
  flattenProblemCollection,
  isGuidedProblemCollection,
} from '@/lib/problems/problem-data';
import type { ApplicationMeta, CategoryMeta, TheoryMeta } from '@/types/problem';

interface PageProps {
  params: Promise<{ category: string }>;
}

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  const categories = problemsData as unknown as CategoryMeta[];
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categories = problemsData as unknown as CategoryMeta[];
  const currentCategory = categories.find((c) => c.id === category);

  if (!currentCategory) {
    return { title: '分类未找到' };
  }

  return {
    title: currentCategory.title,
    description: currentCategory.description,
  };
}

function isSafeCategoryId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id);
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categoryId } = await params;
  const categories = problemsData as unknown as CategoryMeta[];
  const currentCategory = categories.find((c) => c.id === categoryId);
  const shouldPaginateProblems = categoryId !== 'leetcode-hot-100';

  if (!currentCategory) {
    notFound();
  }

  const problemFileData = isSafeCategoryId(categoryId) ? getCategoryProblemData(categoryId) : [];
  const applications = (
    isSafeCategoryId(categoryId) ? getCategoryApplicationsData(categoryId) : []
  ) as ApplicationMeta[];
  const theories = (
    isSafeCategoryId(categoryId) ? getCategoryTheoryData(categoryId) : []
  ) as TheoryMeta[];

  const guidedStages = buildStudyStages(problemFileData);
  const isGuided = isGuidedProblemCollection(problemFileData);
  const orderedProblems = flattenProblemCollection(problemFileData);

  return (
    <div className="container mx-auto px-4 py-3.5 sm:py-4.5">
      <div className="mb-2 flex items-start gap-3 sm:mb-6 sm:gap-4">
        <div className="hidden pt-1 sm:block sm:pt-0">
          <BackButton
            fallbackHref="/problems"
            strict
            className="inline-flex cursor-pointer rounded-xl border border-slate-700 bg-slate-800/50 p-2.5 transition-colors hover:border-blue-500/50"
          />
        </div>
        <div className="flex-1">
          <h1 className="mb-2.5 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl">
            {currentCategory.title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">
            {currentCategory.description}
          </p>
        </div>
      </div>

      <section className="mb-6 sm:mb-16">
        <div className="mb-3 flex items-center gap-2 sm:mb-6 sm:gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold sm:text-2xl">算法题</h2>
          <span className="text-sm text-muted-foreground">({orderedProblems.length})</span>
        </div>

        {isGuided ? (
          <ArrayStudyRoadmap stages={guidedStages} />
        ) : (
          <ProblemList
            problems={orderedProblems}
            compactOnMobile
            paginate={shouldPaginateProblems}
          />
        )}
      </section>

      {theories.length > 0 && (
        <section className="mb-6 sm:mb-16">
          <div className="mb-3 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold sm:text-2xl">理论知识</h2>
            <span className="text-sm text-muted-foreground">({theories.length})</span>
          </div>

          <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {theories.map((theory) => (
              <AlgoCard
                key={theory.id}
                id={theory.id}
                title={theory.title}
                description={theory.description}
                tags={theory.tags}
                href={theory.link || `/problems/${categoryId}/${theory.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {applications.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Briefcase className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold sm:text-2xl">实际应用</h2>
            <span className="text-sm text-muted-foreground">({applications.length})</span>
          </div>

          <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {applications.map((app) => (
              <AlgoCard
                key={app.id}
                id={app.id}
                title={app.title}
                description={app.description}
                tags={app.tags}
                href={app.link || `/problems/${categoryId}/${app.id}`}
                difficulty={app.difficulty}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
