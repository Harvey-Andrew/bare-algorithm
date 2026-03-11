import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

import { ClientNavbar } from '@/components/shared/ClientNavbar';
import { NavigationTracker } from '@/components/shared/NavigationTracker';
import { ScrollRestorationTracker } from '@/components/shared/ScrollRestorationTracker';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.barealgo.com'),
  title: {
    default: '朴素算法',
    template: '%s',
  },
  description: '通过交互式动画直观理解算法逻辑，覆盖 200+ LeetCode 题目的可视化解题',
  keywords: [
    '算法可视化',
    'LeetCode',
    '数据结构',
    '算法动画',
    '交互式学习',
    'algorithm visualization',
  ],
  authors: [{ name: '朴素算法' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '朴素算法',
    title: '朴素算法',
    description: '通过交互式动画直观理解算法逻辑，覆盖 200+ LeetCode 题目的可视化解题',
    images: [
      {
        url: '/barealgo.png',
        width: 288,
        height: 286,
        alt: '朴素算法 - 算法可视化平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '朴素算法',
    description: '通过交互式动画直观理解算法逻辑，覆盖 200+ LeetCode 题目的可视化解题',
    images: ['/barealgo.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        style={{ minHeight: '100dvh' }}
      >
        {process.env.NODE_ENV === 'development' ? (
          <Script id="react-devtools-runtime-guard" strategy="beforeInteractive">
            {`
              (() => {
                if (window.__ALGO_REACT_DEVTOOLS_GUARD_INSTALLED__) return;
                window.__ALGO_REACT_DEVTOOLS_GUARD_INSTALLED__ = true;

                const targetMessage =
                  'We are cleaning up async info that was not on the parent Suspense boundary. This is a bug in React.';
                const extensionId = 'fmkadmapgofadopljbjfkapdkoienihi';
                const hookName = '__REACT_DEVTOOLS_GLOBAL_HOOK__';

                const createDisabledHook = () => ({
                  isDisabled: true,
                  supportsFiber: true,
                  inject: () => {},
                  onCommitFiberRoot: () => {},
                  onCommitFiberUnmount: () => {},
                  onPostCommitFiberRoot: () => {},
                });

                const markHookDisabled = () => {
                  try {
                    const currentHook = window[hookName];
                    if (currentHook && typeof currentHook === 'object') {
                      currentHook.isDisabled = true;
                      currentHook.inject = () => {};
                      currentHook.onCommitFiberRoot = () => {};
                      currentHook.onCommitFiberUnmount = () => {};
                      currentHook.onPostCommitFiberRoot = () => {};
                      return;
                    }

                    if (!currentHook) {
                      Object.defineProperty(window, hookName, {
                        configurable: true,
                        enumerable: false,
                        writable: true,
                        value: createDisabledHook(),
                      });
                    }
                  } catch {}
                };

                const isFromDevtools = (text) =>
                  text.includes(extensionId) ||
                  text.includes('installHook.js') ||
                  text.includes('chrome-extension://');

                const shouldSilence = (text) =>
                  text.includes(targetMessage) && (isFromDevtools(text) || text.trim() === targetMessage);

                const toText = (value) => {
                  if (typeof value === 'string') return value;
                  if (value instanceof Error) {
                    return value.message + ' ' + (value.stack ?? '');
                  }
                  try {
                    return JSON.stringify(value);
                  } catch {
                    return String(value);
                  }
                };

                markHookDisabled();

                const originalError = console.error.bind(console);
                const originalWarn = console.warn.bind(console);

                const silenceConsole = (original) => (...args) => {
                  const text = args.map(toText).join(' ');
                  if (shouldSilence(text)) return;
                  original(...args);
                };

                console.error = silenceConsole(originalError);
                console.warn = silenceConsole(originalWarn);

                window.addEventListener(
                  'error',
                  (event) => {
                    const message = event?.message || '';
                    const stack = event?.error?.stack || '';
                    const text = (message + ' ' + stack).trim();

                    if (!shouldSilence(text)) return;

                    event.preventDefault();
                    event.stopImmediatePropagation();
                  },
                  true
                );

                window.addEventListener(
                  'unhandledrejection',
                  (event) => {
                    const text = toText(event?.reason);

                    if (!shouldSilence(text)) return;

                    event.preventDefault();
                    event.stopImmediatePropagation();
                  },
                  true
                );
              })();
            `}
          </Script>
        ) : null}

        {/* Navigation */}
        <ClientNavbar />
        <NavigationTracker />
        <ScrollRestorationTracker />

        {/* Main content */}
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
