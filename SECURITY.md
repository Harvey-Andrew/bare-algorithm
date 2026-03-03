# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1.0 | No        |

## Security Measures

本项目采用以下安全保障措施：

### HTTP 安全头

通过 `next.config.ts` 为所有路由注入安全头：

| Header                      | Value                                             |
| --------------------------- | ------------------------------------------------- |
| `X-Frame-Options`           | `DENY`                                            |
| `X-Content-Type-Options`    | `nosniff`                                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`        |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`    |
| `Content-Security-Policy`   | `default-src 'self'; frame-ancestors 'none'; ...` |

### 自动化安全审计

```bash
pnpm security:audit       # 本地一站式安全检查
pnpm security:audit:ci    # CI 模式（失败时退出码非零）
```

审计内容包括：

- **依赖漏洞扫描** — 检查已知 CVE
- **密钥 / 敏感信息检测** — 扫描代码中的硬编码凭据
- **开源许可证合规** — 验证依赖 License 兼容性
- **HTTP 安全头验证** — 确认部署后响应头完整性

### 供应链安全

- **Dependabot** 自动监控 npm 及 GitHub Actions 依赖更新
- **pnpm overrides** 锁定已知有漏洞的传递依赖版本
- **CI Security Audit Job** 在每次 push/PR 时自动运行安全检查

## Reporting A Vulnerability

Do not open public issues for security reports.

1. Use GitHub Private Vulnerability Reporting in this repository (`Security` -> `Advisories` -> `Report a vulnerability`).
2. Include affected paths, impact, reproduction steps, and suggested mitigation if available.

Target response windows:

- Initial acknowledgement: within 72 hours
- Triage and severity decision: within 7 calendar days
- Fix timeline: depends on severity and exploitability

If private reporting is unavailable, contact the repository owner directly and include `[SECURITY]` in the subject.
