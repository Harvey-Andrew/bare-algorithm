export const DEFAULT_MODE_ACTIVE_COLOR_CLASSES = [
  'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
  'bg-sky-600 text-white shadow-lg shadow-sky-500/30',
  'bg-violet-600 text-white shadow-lg shadow-violet-500/30',
] as const;

export function getDefaultModeActiveColorClass(modeIndex: number): string {
  const safeIndex =
    ((modeIndex % DEFAULT_MODE_ACTIVE_COLOR_CLASSES.length) +
      DEFAULT_MODE_ACTIVE_COLOR_CLASSES.length) %
    DEFAULT_MODE_ACTIVE_COLOR_CLASSES.length;

  return DEFAULT_MODE_ACTIVE_COLOR_CLASSES[safeIndex];
}
