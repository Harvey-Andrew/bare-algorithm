import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/types/problem';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  easy: {
    label: '简单',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  medium: {
    label: '中等',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  hard: {
    label: '困难',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
