'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { hasAppNavHistory } from '@/lib/nav-tracker';

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && hasAppNavHistory()) {
      window.history.back(); // 使用原生 API 更有助于恢复滚动位置
    } else {
      router.push('/'); // 无历史记录则回首页
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center relative overflow-hidden"
      style={{ minHeight: 'calc(100dvh - 64px)' }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500 opacity-5 blur-[120px] rounded-full" />
      </div>

      <div className="space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500">
        <h1 className="text-6xl sm:text-7xl font-black landing-s2-headline">
          <span className="line2">敬请期待</span>
        </h1>

        <div className="space-y-4">
          <div className="text-slate-400 text-base sm:text-lg leading-relaxed flex flex-col gap-4">
            <p>我们还没有在这个分类下实现你寻找的算法。</p>

            <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 flex flex-col items-center">
              <span className="text-xl mb-2">🌟</span>
              <p className="text-slate-200 font-medium mb-3 text-center">
                欢迎为此项目贡献代码！你可以直接提交 PR 帮助我们完善内容。
              </p>
              <a
                href="https://github.com/Harvey-Andrew/bare-algorithm/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm sm:text-base"
              >
                前往 GitHub 提交 PR (Pull Request) <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-sm mt-2 text-slate-500">
              或者，你也可以前往
              <a
                href="https://aistudio.google.com/u/1/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline mx-1 inline-flex items-baseline gap-1 transition-colors"
              >
                Google AI Studio <ExternalLink className="w-3 h-3 self-center" />
              </a>
              快速生成自定义算法可视化。
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mx-auto sm:max-w-none">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-slate-300 h-12 cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回上一页
          </Button>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-500 text-white border-0"
            style={{ backgroundColor: '#2563eb', color: 'white' }}
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              回到首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
