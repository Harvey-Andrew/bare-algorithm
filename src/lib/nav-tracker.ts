/**
 * 应用内导航深度追踪器（模块级变量）
 *
 * 模块变量在 SPA 导航中持久存在，但在全页面加载时重置。
 * 这正好满足我们的需求：
 * - 全页面加载（直接输入 URL/刷新）→ navCount = 0 → 无法 router.back()
 * - SPA 导航（点击 Link）→ navCount > 0 → 可以安全 router.back()
 */

let navCount = 0;

/** 标记发生了一次应用内导航（由 NavigationTracker 调用） */
export function incrementNavCount() {
  navCount++;
}

/** 是否有可以回退的应用内导航历史 */
export function hasAppNavHistory() {
  return navCount > 0;
}
