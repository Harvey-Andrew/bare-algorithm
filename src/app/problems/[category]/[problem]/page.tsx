import { notFound } from 'next/navigation';

import { TypeScriptCodeHint } from '@/components/shared/TypeScriptCodeHint';
import { ProblemVisualizerClient } from '@/components/visualizer/ProblemVisualizerClient';
import { getCategoryProblemData } from '@/lib/problems/problem-catalog.generated';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { getAllProblemRouteParams, isKnownProblemRoute } from '@/lib/problems/problem-server';

interface ProblemMeta {
  id: string;
  title: string;
}

interface PageProps {
  params: Promise<{
    category: string;
    problem: string;
  }>;
}

function getProblemMeta(category: string, problem: string): ProblemMeta | null {
  if (!isKnownProblemRoute(category, problem)) {
    return null;
  }

  const data = getCategoryProblemData(category);
  return findProblemMeta(data, problem) || null;
}

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllProblemRouteParams();
}

export default async function ProblemPage({ params }: PageProps) {
  const { category, problem } = await params;
  if (!isKnownProblemRoute(category, problem)) {
    notFound();
  }

  const meta = getProblemMeta(category, problem);
  if (!meta) {
    notFound();
  }

  return (
    <div className="bg-slate-950">
      <TypeScriptCodeHint />
      <ProblemVisualizerClient category={category} problemSlug={problem} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { category, problem } = await params;
  if (!isKnownProblemRoute(category, problem)) {
    return {
      title: `${problem}`,
    };
  }

  const meta = getProblemMeta(category, problem);

  return {
    title: meta?.title ? `可视化 ${meta.title}` : `${problem}`,
  };
}
