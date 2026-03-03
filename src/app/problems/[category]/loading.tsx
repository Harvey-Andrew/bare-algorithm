export default function CategoryLoading() {
  return (
    <div className="container mx-auto py-12 px-4 animate-pulse">
      <div className="h-10 w-64 rounded-lg bg-slate-800/70 mx-auto mb-6" />
      <div className="h-5 w-96 max-w-full rounded bg-slate-800/50 mx-auto mb-12" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-44 rounded-2xl border border-slate-800 bg-slate-900/50" />
        ))}
      </div>
    </div>
  );
}
