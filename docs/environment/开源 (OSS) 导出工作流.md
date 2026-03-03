# 开源 (OSS) 导出工作流

本项目的主代码库采用**私有库到公开库 (Private-to-Public)** 的单向导出工作流机制：

- **私有仓库 (Private Repo)**：包含完整的项目代码、私有的内部文档资料以及生产环境的部署相关配置。所有实际开发工作均在此仓库进行。
- **公开仓库 (Public Repo)**：由私有仓库生成的、经过脱敏和清理后的代码快照 (Snapshot)。此仓库用于对外开源及社区分享。

## 本地导出测试 (Local Export)

如果你需要在本地生成代码快照或验证导出结果，请在私有仓库的根目录下执行以下命令：

```bash
pnpm run oss:export
```

默认情况下，导出流程执行完毕后，生成的开源代码快照会保存在项目根目录的以下文件夹中：

```text
.oss-export/
```

如果你希望将导出内容保存在自定义的文件路径（例如用于特定版本预览或避免覆盖之前的导出），可以通过添加参数来指定自定义输出目录：

```bash
pnpm run oss:export -- --out-dir .oss-export-preview
```

## 导出规则配置 (Export Rules)

导出的核心过滤逻辑和规则维护在以下配置文件中：

```text
scripts/oss-export.config.json
```

该配置文件的主要控制维度包含：

- `removePaths`：指定应在开源快照中被移除的文件或目录路径。通常用于移除包含敏感信息的私有内部文档 (docs)、非公开静态资源 (assets) 或私有测试用例 (tests)。
- `problemExport.allowlist`：算法题目的导出白名单。当前策略为**只保留 LeetCode “热门 100” (Hot 100) 的前 10 道题**。所有其他分类及未经明确列入此名单的题目一律不会开源至公开库，防止研发中的题目意外流出。
- `removeMarkdownFileNames`：用于批量移除所有题目目录下指定名称的 Markdown 辅助文档。例如，你可以配置强制移除 `solution.md`，以确保官方题解不会被同步至公开库。

## GitHub Actions 自动同步 (CI/CD Sync)

为了实现私有库向公开库的自动化发布与同步，我们配置了 GitHub Actions 工作流。该触发器文件位于：

```text
.github/workflows/oss-sync.yml
```

**前置依赖配置**：

若要使该自动化工作流正常运行，必须事先在**私有仓库**的设置面板 (Settings -> Secrets and variables -> Actions) 中注入以下两个强制要求的 Repository Secrets：

1. `OSS_REPO`：目标公开仓库的相对路径标识，格式必须为 `组织或用户名/公开仓库名称`（例如 `owner/public-repo-name`）。
2. `OSS_SYNC_TOKEN`：具有对目标公开仓库**写入 (Write)** 权限的 GitHub Personal Access Token (PAT) 经典版或者细颗粒度令牌 (Fine-grained token)。

**工作流整体原理解析**：

当自动化同步被触发时，Action 将会运行我们在本地执行一样的内部导出操作产生 `.oss-export` 目录。生成完成后，系统会将产生的全新脱敏代码快照**强制推送 (Force-push)** 至目标公开仓库的 `main` 默认分支。
⚠️ **重要提示**：此行为是以私有库作为唯一事实来源 (Single Source of Truth) 的纯覆盖操作，任何直接前往公开库主分支手动提交的代码均会在下一次同步时被完全抹除。
