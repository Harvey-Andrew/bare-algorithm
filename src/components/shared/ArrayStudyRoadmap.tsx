import { Sparkles } from 'lucide-react';

import type { StudyStageWithProblems } from '@/types/problem';
import { ProblemList } from './ProblemList';

interface ArrayStudyRoadmapProps {
  stages: StudyStageWithProblems[];
}

export function ArrayStudyRoadmap({ stages }: ArrayStudyRoadmapProps) {
  return (
    <div className="space-y-4 sm:space-y-8">
      {stages.map((stage) => (
        <section
          key={stage.id}
          className="overflow-hidden rounded-[24px] border border-sky-300/10 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_22%),linear-gradient(180deg,rgba(13,18,32,0.96),rgba(8,12,24,0.98))] shadow-[0_24px_80px_rgba(2,6,23,0.34)] sm:rounded-[28px]"
        >
          <article className="px-3.5 py-3 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[0.02em] text-white sm:text-[15px]">
                {stage.title}
              </h3>
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-100 sm:size-8">
                <Sparkles className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-300 sm:mt-1.5 sm:leading-6">
              {stage.description}
            </p>
          </article>

          <div className="bg-black/10 px-3.5 pt-1.5 pb-3.5 sm:px-5 sm:pt-2 sm:pb-5">
            <ProblemList problems={stage.problems} compactOnMobile />
          </div>
        </section>
      ))}
    </div>
  );
}
