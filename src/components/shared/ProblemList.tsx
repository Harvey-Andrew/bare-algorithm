import type { ProblemMeta } from '@/types/problem';
import { ProblemCard } from './ProblemCard';
import { ProblemListClient } from './ProblemListClient';

interface ProblemListProps {
  problems: ProblemMeta[];
  compactOnMobile?: boolean;
  paginate?: boolean;
}

const ITEMS_PER_PAGE = 25;

function StaticProblemGrid({ problems, compactOnMobile = false }: ProblemListProps) {
  return problems.length > 0 ? (
    <div
      className={
        compactOnMobile
          ? 'grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
    >
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  ) : (
    <div className="rounded-lg bg-muted/30 py-12 text-center text-muted-foreground">
      No problems yet. Stay tuned...
    </div>
  );
}

export function ProblemList({
  problems,
  compactOnMobile = false,
  paginate = true,
}: ProblemListProps) {
  if (!paginate || problems.length <= ITEMS_PER_PAGE) {
    return <StaticProblemGrid problems={problems} compactOnMobile={compactOnMobile} />;
  }

  return <ProblemListClient problems={problems} compactOnMobile={compactOnMobile} />;
}
