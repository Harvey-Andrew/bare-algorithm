import type { MetadataRoute } from 'next';

import categoriesData from '@/lib/problems/categories.json';
import { getAllProblemRouteParams } from '@/lib/problems/problem-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://algo.example.com';

interface CategoryEntry {
  id: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = (categoriesData as CategoryEntry[]).map((category) => category.id);
  const problems = getAllProblemRouteParams();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/problems/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const problemPages: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${SITE_URL}/problems/${problem.category}/${problem.problem}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...problemPages];
}
