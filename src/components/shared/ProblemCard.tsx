import type { ProblemMeta } from '@/types/problem';
import { AlgoCard } from './AlgoCard';

interface ProblemCardProps {
  problem: ProblemMeta;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <AlgoCard
      id={problem.id}
      title={problem.title}
      tags={problem.tags}
      href={`/problems/${problem.category}/${problem.id}`}
      difficulty={problem.difficulty}
      reserveTagRows={2}
    />
  );
}
