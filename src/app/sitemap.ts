import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

import { flattenProblemCollection } from '@/lib/problems/problem-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://algo.example.com';

interface ProblemEntry {
  id: string;
  category: string;
}

function getAllProblems(): ProblemEntry[] {
  const problemsDir = path.join(process.cwd(), 'src', 'lib', 'problems');
  const categories = fs.readdirSync(problemsDir).filter((dir) => {
    const fullPath = path.join(problemsDir, dir);
    return (
      fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'problem.json'))
    );
  });

  const problems: ProblemEntry[] = [];
  for (const category of categories) {
    try {
      const jsonPath = path.join(problemsDir, category, 'problem.json');
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as unknown[];
      for (const problem of flattenProblemCollection(data)) {
        problems.push({ id: problem.id, category });
      }
    } catch {
      // 跳过无法解析的分类
    }
  }
  return problems;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const problems = getAllProblems();

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // 分类页面
  const categories = [...new Set(problems.map((p) => p.category))];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/problems/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 题目页面
  const problemPages: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${SITE_URL}/problems/${problem.category}/${problem.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...problemPages];
}
