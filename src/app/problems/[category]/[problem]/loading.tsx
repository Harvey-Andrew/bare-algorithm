export default function ProblemLoading() {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col">
      {/* 顶部操作栏骨架 */}
      <div className="container mx-auto px-4 py-6">
        <div className="h-14 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
      </div>

      {/* 中部加载指示器 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 -mt-20">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-slate-300 text-lg font-medium">正在加载可视化...</p>
          <p className="text-slate-500 text-sm">准备算法动画引擎</p>
        </div>
      </div>

      {/* 底部骨架区域 */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-pulse">
          <div className="lg:col-span-7 h-[200px] rounded-2xl border border-slate-800 bg-slate-900/50" />
          <div className="lg:col-span-5 h-[200px] rounded-2xl border border-slate-800 bg-slate-900/50" />
        </div>
      </div>
    </div>
  );
}
