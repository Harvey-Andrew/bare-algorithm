# `/problems` 页面静态化与缓存优化

## 1. 背景

`/problems` 与 `/problems/[category]` 页面使用的数据均来自仓库内的静态 JSON 文件。  
在这种前提下，最合适的策略是让页面在构建阶段预渲染，并避免运行时重复读取磁盘文件。

本文档记录 2026-02-28 的优化改动与验证结果。

## 2. 优化目标

- 加快进入 `/problems` 的首屏响应速度
- 加快进入 `/problems/[category]` 的页面响应速度
- 减少运行时不必要的服务端计算与文件 I/O
- 明确固定数据页面的渲染边界，避免退回动态渲染

## 3. 改动范围

- `src/app/problems/page.tsx`
- `src/app/problems/[category]/page.tsx`

## 4. 具体优化方案

### 4.1 `/problems` 强制静态化

在 `src/app/problems/page.tsx` 增加：

```ts
export const dynamic = 'force-static';
export const revalidate = false;
```

效果：

- 该路由固定走静态内容输出
- 不在运行时重新计算页面内容

### 4.2 `/problems/[category]` 明确 SSG 边界

在 `src/app/problems/[category]/page.tsx` 增加：

```ts
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;
```

并保留 `generateStaticParams()`，用于在构建时生成所有分类页面。

效果：

- 所有已知 `category` 在构建期生成静态 HTML
- 未在 `generateStaticParams()` 中出现的分类路径直接返回 404
- 避免线上请求触发动态兜底渲染

### 4.3 分类页 JSON 读取增加进程内缓存

对 `problem.json`、`applications.json`、`theory.json` 的读取统一到泛型读取函数，并加入 `Map` 缓存：

```ts
const categoryFileCache = new Map<string, unknown[]>();
```

缓存键格式：

```ts
`${categoryId}/${fileName}`;
```

效果：

- 同一进程内重复访问分类页时，减少重复磁盘读取
- 尤其在本地开发频繁切换分类页时更稳定

## 5. 验证结果

### 5.1 代码质量

- `pnpm lint` 通过

### 5.2 构建结果

- `pnpm build` 通过
- 构建路由输出显示：
  - `/problems` 为 `○ Static`
  - `/problems/[category]` 为 `● SSG`

说明该两类页面已按预期走静态预渲染策略。

## 6. 性能收益说明

- 线上请求路径更短：直接返回预生成页面内容
- 服务端运行时开销更低：减少动态渲染和重复 JSON 读取
- 用户体感更快：分类页与分类列表页进入速度更稳定

## 7. 边界与注意事项

- 由于 `dynamicParams = false`，新增分类后必须重新构建部署，否则新分类路径会 404
- 由于 `revalidate = false`，JSON 内容更新后必须重新构建部署才能生效
- `next dev` 下首次打开慢通常与开发模式按需编译有关，不等同于生产性能

## 8. 后续可选优化

- 若题目详情页 `/problems/[category]/[problem]` 数据也固定，可评估进一步静态化
- 使用现有性能脚本做前后对比，沉淀量化数据：
  - `pnpm perf:full`
  - `pnpm perf:report:visualize`
