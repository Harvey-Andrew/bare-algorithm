const SCROLL_POSITION_KEY_PREFIX = 'scroll-position:';
const PENDING_RESTORE_PATH_KEY = 'scroll-restore:pending-path';
const PENDING_RESTORE_SCROLL_KEY = 'scroll-restore:pending-scroll';
const HISTORY_RESTORE_ARMED_KEY = 'scroll-restore:history-armed';

function getScrollPositionKey(pathname: string) {
  return `${SCROLL_POSITION_KEY_PREFIX}${pathname}`;
}

function canUseSessionStorage() {
  return typeof window !== 'undefined';
}

export function saveScrollPosition(pathname: string, scrollY: number) {
  if (!canUseSessionStorage()) return;

  try {
    sessionStorage.setItem(
      getScrollPositionKey(pathname),
      String(Math.max(0, Math.round(scrollY)))
    );
  } catch {
    // Ignore storage access failures.
  }
}

export function getSavedScrollPosition(pathname: string): number | null {
  if (!canUseSessionStorage()) return null;

  try {
    const rawValue = sessionStorage.getItem(getScrollPositionKey(pathname));
    if (!rawValue) return null;

    const parsedValue = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  } catch {
    return null;
  }
}

export function clearSavedScrollPosition(pathname: string) {
  if (!canUseSessionStorage()) return;

  try {
    sessionStorage.removeItem(getScrollPositionKey(pathname));
  } catch {
    // Ignore storage access failures.
  }
}

export function markPendingScrollRestore(pathname: string) {
  if (!canUseSessionStorage()) return;

  try {
    const savedScrollY = sessionStorage.getItem(getScrollPositionKey(pathname));
    sessionStorage.setItem(PENDING_RESTORE_PATH_KEY, pathname);
    if (savedScrollY !== null) {
      sessionStorage.setItem(PENDING_RESTORE_SCROLL_KEY, savedScrollY);
    } else {
      sessionStorage.removeItem(PENDING_RESTORE_SCROLL_KEY);
    }
  } catch {
    // Ignore storage access failures.
  }
}

export function clearPendingScrollRestore(pathname?: string) {
  if (!canUseSessionStorage()) return;

  try {
    const pendingPath = sessionStorage.getItem(PENDING_RESTORE_PATH_KEY);
    if (pathname && pendingPath !== pathname) return;

    sessionStorage.removeItem(PENDING_RESTORE_PATH_KEY);
    sessionStorage.removeItem(PENDING_RESTORE_SCROLL_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function armHistoryScrollRestore() {
  if (!canUseSessionStorage()) return;

  try {
    sessionStorage.setItem(HISTORY_RESTORE_ARMED_KEY, '1');
  } catch {
    // Ignore storage access failures.
  }
}

export function consumeHistoryScrollRestore() {
  if (!canUseSessionStorage()) return false;

  try {
    const isArmed = sessionStorage.getItem(HISTORY_RESTORE_ARMED_KEY) === '1';
    sessionStorage.removeItem(HISTORY_RESTORE_ARMED_KEY);
    return isArmed;
  } catch {
    return false;
  }
}

export function clearHistoryScrollRestore() {
  if (!canUseSessionStorage()) return;

  try {
    sessionStorage.removeItem(HISTORY_RESTORE_ARMED_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function consumePendingScrollRestore(pathname: string): number | null {
  if (!canUseSessionStorage()) return null;

  try {
    const pendingPath = sessionStorage.getItem(PENDING_RESTORE_PATH_KEY);
    if (pendingPath !== pathname) return null;

    const pendingScrollY = sessionStorage.getItem(PENDING_RESTORE_SCROLL_KEY);

    sessionStorage.removeItem(PENDING_RESTORE_PATH_KEY);
    sessionStorage.removeItem(PENDING_RESTORE_SCROLL_KEY);

    if (!pendingScrollY) return null;

    const parsedValue = Number.parseInt(pendingScrollY, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  } catch {
    return null;
  }
}
