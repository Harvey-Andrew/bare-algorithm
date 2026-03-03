# 题目页 3MB 首包问题排查与修复

## 1. 背景

2026-03-03 在对题目详情页进行打包分析时，发现两个核心路由的首包体积异常：

- `/problems/[category]/[problem]`
- `/problems/[category]/[problem]/solution`

虽然这两个页面本身都是静态生成页面，但构建产物显示它们共享了一个约 3MB 的初始客户端 chunk，导致首屏 JS 明显失控。

## 2. 问题现象

异常快照基线为 `2026-03-03-192350`，以下数据均基于该次构建快照统计。

当时的关键指标如下：

| 指标                                              |     数值 |
| ------------------------------------------------- | -------: |
| Initial Parsed                                    | 4686.3KB |
| Initial Gzip                                      | 1374.0KB |
| `app/problems/[category]/[problem]/page`          | 3194.0KB |
| `app/problems/[category]/[problem]/solution/page` | 3201.6KB |

最大的异常初始 chunk 是：

- `static/chunks/3576-*.js`
- 体积约 `3027KB parsed / 824KB gzip`

更反常的一点是：题解页本身并不渲染可视化组件，但它仍然和题目详情页共享这个超大初始 chunk。

## 3. 排查过程

### 3.1 先排除错误方向

最开始怀疑的是以下几类问题：

- `ProblemVisualizerClient` 的运行时动态导入失效
- 题目 loader 生成策略把所有题目错误合并到了同一个模块
- Next.js 在 `[problem]` 路由段上没有正确做代码分割

围绕这些方向做过几轮实验，包括：

- 将题目 loader 从单文件拆成按分类的二级 generated loader
- 调整 route group
- 尝试强制拆 webpack async chunk

这些实验都没有实质收益，问题页仍然维持在 3MB 级别。

### 3.2 关键证据来自 `client-reference-manifest`

真正的突破点来自构建后的 RSC manifest：

- `.next/server/app/problems/[category]/[problem]/page_client-reference-manifest.js`
- `.next/server/app/problems/[category]/[problem]/solution/page_client-reference-manifest.js`

排查时统计到：

- 两个 manifest 中都包含 `242` 个唯一的 `src/lib/problems/*/*/index.tsx`
- 两个 route 的题目模块列表完全一致

这说明问题不是单个页面自己引了大模块，而是某个共享依赖把整棵题库的客户端引用图污染到了 `[problem]` 这个 route segment。

### 3.3 锁定污染链路

最终定位到这条链：

1. [ProblemVisualizerClient.tsx](../../src/components/visualizer/ProblemVisualizerClient.tsx) 在客户端动态导入 `problem-loaders.generated.ts`
2. [problem-loaders.generated.ts](../../src/lib/problems/problem-loaders.generated.ts) 是题目配置的客户端 loader 入口
3. [problem-server.ts](../../src/lib/problems/problem-server.ts) 原先也直接从 `problem-loaders.generated.ts` 读取 `CATEGORY_PROBLEM_EXPORTS`
4. `problem-server.ts` 同时被题目详情页和题解页使用，用于：
   - `isKnownProblemRoute`
   - `getAllProblemRouteParams`
5. 结果是：一个本应只在客户端按需使用的 loader 入口，被服务端路由工具错误复用，进而进入了 `[problem]` route segment 的共享依赖图

这就是为什么题解页虽然不渲染可视化器，仍然被拖上了整棵题库的客户端模块。

## 4. 根因总结

根因不是“页面是动态的”或“动态导入失效”，而是：

> 服务端路由元数据与客户端题目加载器耦合在同一个 generated 文件中，导致 Next.js 将整套题目 loader 视为共享 route segment 依赖，从而污染了 `client-reference-manifest`。

更具体地说，`CATEGORY_PROBLEM_EXPORTS` 这个“纯路由存在性映射”本质上是服务端静态元数据，不应该和 `loadProblemConfig()` 这种客户端运行时加载逻辑放在同一个入口文件里。

## 5. 修复方案

修复思路很简单：把“服务端路由映射”和“客户端题目 loader”彻底拆开。

### 5.1 生成独立的路由映射文件

在 [scripts/generate-problem-loaders.mjs](../../scripts/generate-problem-loaders.mjs) 中新增：

- `src/lib/problems/__generated__/problem-routes.generated.ts`

这个文件只负责输出：

- `CATEGORY_PROBLEM_EXPORTS`

不再包含任何客户端 loader 逻辑。

### 5.2 让服务端工具只读路由映射

[problem-server.ts](../../src/lib/problems/problem-server.ts) 改为只从：

- `@/lib/problems/__generated__/problem-routes.generated`

读取题目路由映射。

这样：

- 服务端的 `isKnownProblemRoute()`、`getAllProblemRouteParams()` 不再触碰客户端 loader
- 客户端的 [ProblemVisualizerClient.tsx](../../src/components/visualizer/ProblemVisualizerClient.tsx) 仍按原方式懒加载 `loadProblemConfig()`

### 5.3 保持原有按题目懒加载能力

[problem-loaders.generated.ts](../../src/lib/problems/problem-loaders.generated.ts) 仍然保留：

- `loadProblemConfig(category, problem)`
- 按分类 generated loader
- 按题目动态导入真实题目 `index.tsx`

也就是说，这次修复没有改变题目页运行时行为，只是把错误的共享依赖边界拆开了。

## 6. 修复结果

最新快照为 `2026-03-03-202528`，以下对比数据基于它与异常基线 `2026-03-03-192350` 的构建结果统计。

关键结果如下：

| 指标                                              |   修复前 |   修复后 |    变化量 |
| ------------------------------------------------- | -------: | -------: | --------: |
| Initial Parsed                                    | 4686.3KB | 1504.5KB | -3181.8KB |
| Initial Gzip                                      | 1374.0KB |  506.4KB |  -867.5KB |
| `app/problems/[category]/[problem]/page`          | 3194.0KB |    8.5KB | -3185.5KB |
| `app/problems/[category]/[problem]/solution/page` | 3201.6KB |   16.2KB | -3185.4KB |

同时，构建后再次检查两个 route 的 `client-reference-manifest`：

- `src/lib/problems/*/*/index.tsx` 的唯一条目数从 `242` 降为 `0`

这说明首包污染源已经被清除。

## 7. 为什么修复后 `All Parsed` 反而上升

这次修复解决的是“首屏初始包异常膨胀”，不是“总产物体积最小化”。

修复后可以观察到：

- `Initial Parsed` 明显下降
- `All Parsed` 和 `All Gzip` 有一定上升

这通常意味着：

- 原来错误进入初始包的内容，被重新放回了异步 chunk
- 首屏成本下降了，但整体异步分包仍可能存在重复打包或共享依赖冗余

这属于后续优化方向，不影响当前“3MB 首包问题已经解决”的结论。

## 8. 验证方式

本次修复完成后执行了以下验证：

```bash
pnpm run generate:problem-loaders
pnpm vitest run tests/scripts/generate-problem-loaders.test.ts tests/lib/problem-loaders.test.ts
pnpm build:analyze
pnpm run bundle:snapshot:after
node scripts/bundle-compare-visualize.mjs --before docs/performance/bundle-analysis/after/2026-03-03-192350 --after docs/performance/bundle-analysis/after/2026-03-03-202528
```

相关测试文件：

- [tests/scripts/generate-problem-loaders.test.ts](../../tests/scripts/generate-problem-loaders.test.ts)
- [tests/lib/problem-loaders.test.ts](../../tests/lib/problem-loaders.test.ts)

## 9. 经验总结

这次问题说明了一个很关键的边界原则：

### 9.1 服务端静态元数据不能混入客户端 loader 入口

只要一个服务端公共工具错误依赖了客户端模块入口，即使页面本身是静态页面，也会把不该进入首屏的 client references 带进共享 route segment。

### 9.2 App Router 下要优先看 `client-reference-manifest`

当出现“页面源码看起来没问题，但首包异常巨大”的情况时，`client-reference-manifest` 往往比普通 bundle analyzer 更快暴露真实依赖污染源。

### 9.3 “页面是 SSG” 不等于 “客户端包很小”

静态 HTML 只说明服务端输出可以预渲染，不代表 hydration 依赖一定轻。真正决定首包大小的，还是客户端引用图。

## 10. 后续建议

当前首包问题已经解决，下一步建议继续做两件事：

1. 检查异步 chunk 是否有重复打包，解释为什么 `All Parsed` 上升
2. 继续梳理题目配置模块中的 `use client` 边界，避免后续再次出现 route segment 污染
