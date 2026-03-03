import fs from 'fs';
import { notFound } from 'next/navigation';

import { SolutionContent } from '@/components/shared/SolutionContent';
import { findProblemMeta } from '@/lib/problems/problem-data';
import {
  getAllProblemRouteParams,
  getProblemJsonPath,
  getSolutionContentPaths,
  isKnownProblemRoute,
} from '@/lib/problems/problem-server';

interface ProblemMeta {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
  externalLinks?: string;
}

function getSolutionContent(category: string, problem: string): string | null {
  try {
    for (const filePath of getSolutionContentPaths(category, problem)) {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    }
  } catch {
    console.error(`Failed to read solution file for ${category}/${problem}`);
  }

  return null;
}

function getProblemMeta(category: string, problem: string): ProblemMeta | null {
  try {
    if (!isKnownProblemRoute(category, problem)) {
      return null;
    }

    const jsonPath = getProblemJsonPath(category);
    if (jsonPath && fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as unknown[];
      return findProblemMeta(data, problem) || null;
    }
  } catch {
    console.error(`Failed to read problem.json for ${category}`);
  }

  return null;
}

interface PageProps {
  params: Promise<{
    category: string;
    problem: string;
  }>;
}

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllProblemRouteParams();
}

export default async function SolutionPage({ params }: PageProps) {
  const { category, problem } = await params;
  if (!isKnownProblemRoute(category, problem)) {
    notFound();
  }

  const meta = getProblemMeta(category, problem);
  if (!meta) {
    notFound();
  }

  const solutionMarkdown = getSolutionContent(category, problem);
  const backHref = `/problems/${category}/${problem}`;

  return (
    <SolutionContent
      solutionMarkdown={solutionMarkdown}
      backHref={backHref}
      title={meta.title}
      externalLinks={meta.externalLinks ?? ''}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { problem, category } = await params;
  if (!isKnownProblemRoute(category, problem)) {
    return {
      title: `${problem}`,
    };
  }

  const meta = getProblemMeta(category, problem);

  return {
    title: meta?.title ? `Solution ${meta.title}` : `${problem}`,
  };
}
