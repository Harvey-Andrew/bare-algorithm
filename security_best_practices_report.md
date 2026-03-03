# 安全最佳实践审计报告

## 执行摘要

对当前仓库进行人工安全审计后，未发现可直接确认为严重或高危的安全问题。仓库内置的自动化审计也已在 2026 年 3 月 3 日执行完成，结果为 0 个依赖漏洞、0 个许可证问题、6/6 个预期安全响应头已配置、4/4 个敏感文件忽略规则已覆盖。

当前最主要的剩余风险有两类。第一，生产环境的 Content Security Policy 仍允许 `script-src 'unsafe-inline'`，这会明显削弱 CSP 对 XSS 的缓解能力。第二，多个可视化组件重复使用了 `dangerouslySetInnerHTML`。我抽查的数据流目前仍受输入解析约束或前置转义保护，因此暂不将其认定为当前可利用的 XSS 漏洞，但这种实现比较脆弱，后续如果输入范围扩大，风险会显著上升。

## 审计范围

- 审计技术栈：TypeScript、React 19、Next.js 16 App Router
- 当前项目形态：纯前端静态展示为主
- 在 `src/` 下未发现 Route Handler、API Route、Middleware、Proxy 或 Server Action
- 已执行自动化审计命令：`pnpm security:audit`

## 中危问题

### SBP-001

- 规则编号：`REACT-CSP-001` / `JS-CSP-001`
- 严重级别：中危
- 位置：`next.config.ts:8`、`next.config.ts:29`
- 证据：

```ts
const scriptSrc = ["'self'", "'unsafe-inline'", isDevelopment ? "'unsafe-eval'" : null];
```

```ts
value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';`,
```

- 影响：一旦生产环境出现 DOM XSS，攻击代码可直接以内联脚本方式执行，CSP 将无法有效阻断该类执行路径。
- 修复建议：将脚本策略改为基于 `nonce` 或 `hash` 的严格 CSP，并确保任何开发环境下的放宽策略仅在开发环境生效。
- 缓解措施：如果 CDN 或边缘层另有更严格的 CSP，需要在运行时核对实际响应头，并明确记录哪一层配置才是最终生效的安全基线。
- 误报说明：这是一个防御纵深问题，不代表当前仓库中已经存在可被利用的 XSS 攻击链。

## 低危问题

### SBP-002

- 规则编号：`REACT-XSS-001` / `REACT-DOM-001`
- 严重级别：低危
- 位置：
  - `src/lib/problems/backtracking/palindrome-partitioning/index.tsx:220`
  - `src/lib/problems/backtracking/n-queens/index.tsx:194`
  - `src/lib/problems/backtracking/letter-combinations-of-a-phone-number/index.tsx:275`
  - `src/lib/problems/backtracking/permutations/index.tsx:148`
  - `src/lib/problems/dynamic-programming/unique-binary-search-trees/index.tsx:358`
  - `src/lib/problems/dynamic-programming/target-sum/index.tsx:388`
- 证据：

```tsx
<div dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br/>') }} />
```

以及：

```tsx
<span
  dangerouslySetInnerHTML={{
    __html: message
      .replace(...)
  }}
/>
```

- 影响：这些注入点当前更多依赖外围输入约束，而不是依赖安全的渲染原语。一旦未来这些组件复用到更宽松的数据源，或输入格式被放宽，容易演变为反射型或存储型 XSS。
- 修复建议：用 JSX 替代 HTML 字符串注入。例如：
  - 使用 `message.split('\n')` 渲染换行
  - 通过 `white-space: pre-wrap` 保留换行显示
  - 对需要高亮的标记，显式构造 `<span>` 节点，而不是拼接 HTML 字符串
- 缓解措施：如果确实必须保留该类注入点，应将转义或净化逻辑集中管理，并把允许的格式能力控制到最小。
- 误报说明：抽样路径目前并未明显达到可利用状态。例如，`src/lib/problems/backtracking/palindrome-partitioning/index.tsx:31` 将输入限制为纯字母，自动补全示例也在 `src/app/demo/array/search-autocomplete/services/search.api.ts:154` 先做了 HTML 转义再注入。

## 信息性说明

- `src/components/shared/SolutionContent.tsx:73` 中的 Markdown 渲染使用的是 `react-markdown`、`remark-gfm` 和按需启用的 `rehype-katex`。仓库内未发现 `rehype-raw` 或其他允许原始 HTML 直通渲染的配置。
- `localStorage` 与 `sessionStorage` 的使用范围目前看仅限于非敏感 UI 状态，例如字体大小、提示展示次数、滚动位置恢复等。
- 新标签页外链均使用了 `rel="noopener noreferrer"`，或通过 `window.open(..., 'noopener,noreferrer')` 打开。

## 自动化审计结果

`pnpm security:audit` 已于 2026 年 3 月 3 日执行成功，并生成以下文件：

- `docs/security/reports/2026-03-03-0910/summary.html`
- `docs/security/reports/2026-03-03-0910/summary.md`
- `docs/security/reports/2026-03-03-0910/summary-data.json`

自动化审计结果如下：

- 依赖漏洞数：0
- 许可证关注项：0
- 已配置安全响应头：6/6
- 敏感文件忽略规则：4/4
- 综合评分：100/100

## 建议的后续动作

1. 将生产环境中的 `script-src 'unsafe-inline'` 替换为基于 `nonce` 的严格 CSP。
2. 在输入能力继续扩展前，移除这 6 处 `dangerouslySetInnerHTML` 用法。
