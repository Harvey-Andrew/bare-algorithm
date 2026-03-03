'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import {
  armHistoryScrollRestore,
  clearHistoryScrollRestore,
  clearPendingScrollRestore,
  clearSavedScrollPosition,
  consumeHistoryScrollRestore,
  consumePendingScrollRestore,
  getSavedScrollPosition,
  markPendingScrollRestore,
  saveScrollPosition,
} from '@/lib/scroll-restoration';

const RESTORE_ATTEMPTS = 12;
const RESTORE_INTERVAL_MS = 120;

function restoreScrollPosition(scrollY: number) {
  if (scrollY < 0) return;

  let attempts = 0;
  let stableHits = 0;

  const tryRestore = () => {
    window.scrollTo(0, scrollY);

    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const reachedTarget = Math.abs(window.scrollY - scrollY) <= 2;

    if (reachedTarget && maxScrollY >= scrollY) {
      stableHits += 1;
    } else {
      stableHits = 0;
    }

    if (stableHits >= 2 || attempts >= RESTORE_ATTEMPTS) {
      return;
    }

    attempts += 1;
    window.setTimeout(() => {
      window.requestAnimationFrame(tryRestore);
    }, RESTORE_INTERVAL_MS);
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(tryRestore);
  });
}

function isReloadNavigation() {
  const navigationEntry = window.performance.getEntriesByType('navigation')[0];
  if (navigationEntry && 'type' in navigationEntry) {
    return navigationEntry.type === 'reload';
  }

  const legacyNavigation = window.performance.navigation;
  return legacyNavigation?.type === legacyNavigation?.TYPE_RELOAD;
}

export function ScrollRestorationTracker() {
  const pathname = usePathname();
  const isFirstMountRef = useRef(true);
  const isHistoryNavigationRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);
  const navigationStackRef = useRef<string[]>([]);
  const currentStackIndexRef = useRef(-1);
  const pendingNavigationTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isNavigatingAwayRef.current) return;
      saveScrollPosition(pathname, window.scrollY);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const destination = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (destination.origin !== currentUrl.origin) return;
      if (
        destination.pathname === currentUrl.pathname &&
        destination.search === currentUrl.search
      ) {
        return;
      }

      isNavigatingAwayRef.current = true;
      pendingNavigationTargetRef.current = destination.pathname;
      saveScrollPosition(pathname, window.scrollY);
    };

    const handlePopState = () => {
      isHistoryNavigationRef.current = true;
      isNavigatingAwayRef.current = true;
      armHistoryScrollRestore();
      markPendingScrollRestore(window.location.pathname);
    };
    const handlePageHide = () => saveScrollPosition(pathname, window.scrollY);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [pathname]);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      navigationStackRef.current = [pathname];
      currentStackIndexRef.current = 0;
      pendingNavigationTargetRef.current = null;

      if (isReloadNavigation()) {
        clearHistoryScrollRestore();
        clearSavedScrollPosition(pathname);
        clearPendingScrollRestore(pathname);
        restoreScrollPosition(0);
      }

      return;
    }

    const pendingScrollY = consumePendingScrollRestore(pathname);
    const historyRestoreArmed = consumeHistoryScrollRestore();
    const pendingTarget = pendingNavigationTargetRef.current;
    let inferredHistoryNavigation = false;

    if (pendingTarget === pathname) {
      const nextStack = navigationStackRef.current.slice(0, currentStackIndexRef.current + 1);
      if (nextStack[nextStack.length - 1] !== pathname) {
        nextStack.push(pathname);
      }
      navigationStackRef.current = nextStack;
      currentStackIndexRef.current = nextStack.length - 1;
      pendingNavigationTargetRef.current = null;
    } else {
      const previousIndex = navigationStackRef.current.lastIndexOf(
        pathname,
        currentStackIndexRef.current - 1
      );
      const nextIndex = navigationStackRef.current.indexOf(
        pathname,
        currentStackIndexRef.current + 1
      );

      if (previousIndex !== -1) {
        currentStackIndexRef.current = previousIndex;
        inferredHistoryNavigation = true;
      } else if (nextIndex !== -1) {
        currentStackIndexRef.current = nextIndex;
        inferredHistoryNavigation = true;
      } else {
        const nextStack = navigationStackRef.current.slice(0, currentStackIndexRef.current + 1);
        if (nextStack[nextStack.length - 1] !== pathname) {
          nextStack.push(pathname);
        }
        navigationStackRef.current = nextStack;
        currentStackIndexRef.current = nextStack.length - 1;
      }
    }

    const shouldRestore =
      isHistoryNavigationRef.current ||
      historyRestoreArmed ||
      inferredHistoryNavigation ||
      pendingScrollY !== null;

    isHistoryNavigationRef.current = false;
    isNavigatingAwayRef.current = false;

    if (!shouldRestore) return;

    restoreScrollPosition(pendingScrollY ?? getSavedScrollPosition(pathname) ?? 0);
  }, [pathname]);

  return null;
}
