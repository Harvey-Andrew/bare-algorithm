import type { ComponentType } from 'react';
import {
  ArrowLeftRight,
  ArrowUpDown,
  BarChart3,
  Calculator,
  ChartLine,
  Cpu,
  Flame,
  Folder,
  FolderTree,
  GitBranch,
  Grid3x3,
  Hash,
  Layers,
  Layers3,
  Link as LinkIcon,
  ListFilter,
  Network,
  RotateCcw,
  Search,
  Share2,
  Sigma,
  Split,
  TrendingUp,
  Type,
} from 'lucide-react';

import type { CategoryMeta } from '@/types/problem';
import { AlgoCard } from './AlgoCard';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Flame,
  Layers,
  Link: LinkIcon,
  Hash,
  Type,
  ArrowLeftRight,
  Layers3,
  GitBranch,
  RotateCcw,
  TrendingUp,
  Grid3x3,
  BarChart3,
  Share2,
  Search,
  ListFilter,
  Calculator,
  Cpu,
  ArrowUpDown,
  Network,
  FolderTree,
  ChartLine,
  Split,
  Sigma,
};

interface CategoryCardProps {
  category: CategoryMeta;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = (category.icon && iconMap[category.icon]) || Folder;

  return (
    <AlgoCard
      id={category.id}
      title={category.title}
      description={category.description}
      tags={[]}
      href={`/problems/${category.id}`}
      leadingIcon={<Icon size={20} className="sm:h-6 sm:w-6" />}
    />
  );
}
