/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复缺陷
        'docs', // 仅文档变动
        'style', // 仅代码格式（不影响运行逻辑）
        'refactor', // 重构（不新增功能、不修 bug）
        'perf', // 性能优化
        'test', // 测试用例新增/修改
        'build', // 构建系统/依赖变更
        'ci', // CI 配置/脚本变更
        'chore', // 杂项（构建外的辅助、脚本、工具、小改动）
        'revert', // 回滚
        'wip', // 开发中
        'workflow', // 工作流程改进
        'types', // 类型定义文件更改
        'release', // 发布新版本
      ],
    ],
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: '📌 请选择提交类型:',
      scope: '🎯 请选择影响范围 (可选):',
      customScope: '请输入自定义的提交范围:',
      subject: '📝 请简要描述更改:\n',
      body: '🔍 详细描述 (可选)。使用 "|" 换行:\n',
      breaking: '列举非兼容性重大变更 (可选)。使用 "|" 换行:\n',
      footerPrefixesSelect: '选择关联 issue 前缀 (可选):',
      customFooterPrefix: '输入自定义 issue 前缀:',
      footer: '🔗 关联的 ISSUE (可选) 例如: #31, #I3244:\n',
      generatingByAI: '正在通过 AI 生成你的提交简短描述...',
      generatedSelectByAI: '选择一个 AI 生成的简短描述:',
      confirmCommit: '✅ 确认提交?',
    },
    types: [
      { value: 'feat', name: '✨ feat:     新功能', emoji: '✨' },
      { value: 'fix', name: '🐛 fix:      修复缺陷', emoji: '🐛' },
      { value: 'docs', name: '📚 docs:     仅文档变动', emoji: '📚' },
      { value: 'style', name: '🎨 style:    代码格式（不影响运行逻辑）', emoji: '🎨' },
      { value: 'refactor', name: '📦 refactor: 重构（不新增功能、不修 bug）', emoji: '📦' },
      { value: 'perf', name: '🚀 perf:     性能优化', emoji: '🚀' },
      { value: 'test', name: '🧪 test:     测试用例新增/修改', emoji: '🧪' },
      { value: 'build', name: '👷 build:    构建系统/依赖变更', emoji: '👷' },
      { value: 'ci', name: '🎡 ci:       CI 配置/脚本变更', emoji: '🎡' },
      { value: 'chore', name: '🔧 chore:    杂项（辅助工具、脚本等）', emoji: '🔧' },
      { value: 'revert', name: '⏪ revert:   回滚代码', emoji: '⏪' },
      { value: 'wip', name: '🚧 wip:      开发中', emoji: '🚧' },
      { value: 'workflow', name: '📋 workflow: 工作流程改进', emoji: '📋' },
      { value: 'types', name: '🏷️  types:    类型定义文件更改', emoji: '🏷️' },
      { value: 'release', name: '🎉 release:  发布新版本', emoji: '🎉' },
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [
      'app', // src/app - Next.js 页面路由
      'components', // src/components - 通用组件
      'ui', // src/components/ui - UI 基础组件
      'visualizer', // src/components/visualizer - 可视化组件
      'shared', // src/components/shared - 共享组件
      'lib', // src/lib - 工具库
      'problems', // src/lib/problems - 算法题目
      'hooks', // src/lib/hooks - 自定义 Hooks
      'store', // src/lib/store - 状态管理
      'types', // src/types - 类型定义
      'docs', // 文档相关
      'build', // 构建配置
    ],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: '以上都不是？我要自定义',
    emptyScopesAlias: '跳过',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: ['body', 'breaking', 'footerPrefix', 'footer'],
    issuePrefixes: [
      { value: 'closed', name: 'closed:   ISSUES has been processed' },
      { value: 'link', name: 'link:     Link to ISSUES' },
    ],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: '跳过',
    customIssuePrefixAlias: '自定义前缀',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: 108,
    maxSubjectLength: 50,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
};
