# Codex Skills 安装与使用

本文档说明如何在本项目中安装、更新和使用 Codex Skills。

## 前置要求

- 已安装并可运行 Codex。
- 终端可访问 GitHub 网络。
- 安装完成后需要重启 Codex 才会生效。

## 安装 Skills

### 安装 OpenAI curated skills

在 Codex 对话中执行以下命令（可按需选择）：

```text
$skill-installer playwright
$skill-installer gh-fix-ci
$skill-installer security-best-practices
$skill-installer security-threat-model
$skill-installer vercel-deploy
$skill-installer screenshot
```

### 安装社区 skills（GitHub 路径）

```text
$skill-installer install https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
$skill-installer install https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns
$skill-installer install https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
```

### 查看本地已安装列表

Windows PowerShell:

```powershell
Get-ChildItem -Directory "$env:USERPROFILE\.codex\skills" | Select-Object -ExpandProperty Name
```

macOS/Linux:

```bash
ls -1 ~/.codex/skills
```

## 本项目推荐 Skills

| Skill                     | 主要用途                             |
| ------------------------- | ------------------------------------ |
| `playwright`              | 浏览器自动化、页面流程回归、截图取证 |
| `gh-fix-ci`               | 分析并修复 GitHub Actions 失败任务   |
| `security-best-practices` | JS/TS/Next.js 安全基线审查           |
| `security-threat-model`   | 输出仓库级威胁建模报告               |
| `vercel-deploy`           | 生成预览部署并返回链接               |
| `screenshot`              | 系统级截图（非浏览器截图）           |
| `react-best-practices`    | React/Next 性能与实践审查            |
| `composition-patterns`    | 组件组合模式重构与 API 设计          |
| `web-design-guidelines`   | UI/可访问性规范审查                  |

## 使用方式

### 显式触发（推荐）

以 `$skill-name` 开头，直接声明要执行的技能与目标：

```text
$playwright 打开 http://localhost:3000，完整走一遍 LRU Cache 页面交互并截图
```

### 自然语言触发

在需求中明确提到技能名也会触发：

```text
请用 gh-fix-ci 分析这个 PR 的 Actions 失败原因，并给出修复方案
```

## 常用模板

```text
$playwright 打开 http://localhost:3000，验证算法播放控件（播放/暂停/进度拖动/倍速）是否正常
$gh-fix-ci 分析当前分支对应 PR 的 GitHub Actions 失败日志，并给出最小修复补丁
$security-best-practices 审查 src 下 Next.js 与 TypeScript 代码，按严重级别列出问题
$security-threat-model 对当前仓库做 threat model，输出 markdown 报告
$vercel-deploy 将当前分支部署为 preview，并返回访问链接
$web-design-guidelines 审查 src/app/page.tsx 的可访问性和视觉层级问题
```

## 维护建议

- 新成员入项时，优先安装本页“本项目推荐 Skills”。
- 每次安装/升级后都重启 Codex。
- 如果安装失败，先检查网络，再重试同一命令。
