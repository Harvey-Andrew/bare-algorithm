export default function SolutionLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header skeleton */}
      <div className="sticky top-[42px] sm:top-12 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-6 py-2 sm:py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-4 animate-pulse">
          <div className="h-6 w-6 rounded bg-slate-800 hidden sm:block shrink-0" />
          <div className="h-6 w-48 rounded-lg bg-slate-800" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          {/* Spinner */}
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">正在加载题解...</p>
        </div>

        {/* Text skeleton lines */}
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-3/4 rounded-lg bg-slate-800/60" />
          <div className="h-4 w-full rounded bg-slate-800/40" />
          <div className="h-4 w-5/6 rounded bg-slate-800/40" />
          <div className="h-4 w-full rounded bg-slate-800/40" />
          <div className="h-4 w-2/3 rounded bg-slate-800/40" />
          <div className="h-32 w-full rounded-xl bg-slate-800/30 mt-6" />
        </div>
      </div>
    </div>
  );
}
