import fs from 'fs';
import { notFound } from 'next/navigation';

import { TypeScriptCodeHint } from '@/components/shared/TypeScriptCodeHint';
import { ProblemVisualizerClient } from '@/components/visualizer/ProblemVisualizerClient';
import { findProblemMeta } from '@/lib/problems/problem-data';
import {
  getAllProblemRouteParams,
  getProblemJsonPath,
  isKnownProblemRoute,
} from '@/lib/problems/problem-server';

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
  try {
    if (!isKnownProblemRoute(category, problem)) {
      return null;
    }

    const jsonPath = getProblemJsonPath(category);
    if (!jsonPath || !fs.existsSync(jsonPath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as unknown[];
    return findProblemMeta(data, problem) || null;
  } catch {
    return null;
  }
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
    title: meta?.title ? `Visualization ${meta.title}` : `${problem}`,
  };
}
