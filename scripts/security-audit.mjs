#!/usr/bin/env node

/**
 * 🛡️ CI 安全审计脚本
 *
 * 自动执行安全检查，并生成可视化报告三件套：
 *   - summary.html   (可视化 HTML 页面)
 *   - summary.md     (Markdown 摘要)
 *   - summary-data.json (原始数据)
 *
 * 使用方式：
 *   node scripts/security-audit.mjs
 *   node scripts/security-audit.mjs --ci    # CI 模式（high+ 漏洞返回非 0）
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

// ─── 配置 ────────────────────────────────────────────
const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const CI_MODE = args.includes('--ci');
const TS = new Date().toISOString().replace(/T/, '-').replace(/:/g, '').slice(0, 15);
const OUT_DIR = join(ROOT, 'docs', 'security', 'reports', TS);
const NOW_ISO = new Date().toISOString();
const _NOW = new Date().toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  dateStyle: 'short',
  timeStyle: 'short',
});

const REQUIRED_HEADERS = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
  'Content-Security-Policy',
];

const BLOCKED_LICENSES = new Set(
  [
    'GPL-2.0',
    'GPL-2.0-only',
    'GPL-2.0-or-later',
    'GPL-3.0',
    'GPL-3.0-only',
    'GPL-3.0-or-later',
    'AGPL-3.0',
    'AGPL-3.0-only',
    'AGPL-3.0-or-later',
    'SSPL-1.0',
  ].map((s) => s.toUpperCase())
);

mkdirSync(OUT_DIR, { recursive: true });

// ─── 工具函数 ────────────────────────────────────────

function tryParseAuditJSON(raw) {
  if (!raw) return null;
  const i1 = raw.indexOf('{\n');
  const i2 = raw.indexOf('{"');
  const start = i1 === -1 ? i2 : i2 === -1 ? i1 : Math.min(i1, i2);
  if (start === -1) return null;
  try {
    const p = JSON.parse(raw.slice(start));
    if (p.error) return null;
    if (p.metadata || p.advisories) return p;
    return null;
  } catch {
    return null;
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse SPDX-like license expressions into normalized tokens.
 * Example: "Apache-2.0 AND LGPL-3.0-or-later" -> ["APACHE-2.0", "LGPL-3.0-OR-LATER"]
 */
function extractLicenseTokens(licenseExpr) {
  const raw = String(licenseExpr || '')
    .replace(/\*/g, '')
    .trim();
  const parts = raw.match(/[A-Za-z0-9.+-]+/g) || [];
  return parts
    .map((p) => p.toUpperCase())
    .filter((p) => p && p !== 'AND' && p !== 'OR' && p !== 'WITH');
}

// ─── 1. 依赖漏洞审计 ────────────────────────────────

console.log('🔍 [1/4] 执行依赖漏洞审计...');
let auditData;
try {
  const result = execSync('pnpm audit --registry https://registry.npmjs.org --json', {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 30_000,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  auditData = tryParseAuditJSON(result);
} catch (e) {
  auditData = tryParseAuditJSON(e.stdout) || tryParseAuditJSON(e.stderr);
}
if (!auditData) {
  const fb = join(ROOT, 'docs', 'security', 'audit-raw.json');
  if (existsSync(fb)) {
    try {
      auditData = JSON.parse(readFileSync(fb, 'utf-8').replace(/^\uFEFF/, ''));
      console.log('  ⚠️ 使用缓存的审计数据');
    } catch {
      auditData = null;
    }
  }
}
if (!auditData) {
  auditData = {
    advisories: {},
    metadata: {
      vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0 },
      totalDependencies: 0,
    },
  };
  console.log('  ⚠️ 无法获取审计数据，跳过');
}

const vulnCounts = auditData.metadata?.vulnerabilities || {
  critical: 0,
  high: 0,
  moderate: 0,
  low: 0,
  info: 0,
};
const totalDeps = auditData.metadata?.totalDependencies || 0;
const totalVulns = Object.values(vulnCounts).reduce((a, b) => a + b, 0);

const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 };
const advisories = Object.values(auditData.advisories || {});
const vulnDetails = advisories
  .map((a) => ({
    id: a.github_advisory_id || `ADV-${a.id}`,
    module: a.module_name,
    severity: a.severity,
    title: a.title?.split('\n')[0]?.slice(0, 100) || '',
    cves: (a.cves || []).join(', ') || 'N/A',
    version: a.findings?.[0]?.version || 'N/A',
    patched: a.patched_versions || 'N/A',
    path: a.findings?.[0]?.paths?.[0] || 'N/A',
    cvss: a.cvss?.score ?? 'N/A',
    recommendation: a.recommendation || '',
    cwe: (a.cwe || []).join(', ') || 'N/A',
    url: a.url || '',
  }))
  .sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

console.log(`  ✅ 扫描 ${totalDeps} 个依赖，发现 ${totalVulns} 个漏洞`);

// ─── 2. 许可证合规 ────────────────────────────────

console.log('📜 [2/4] 执行许可证合规检查...');
let licenseData = {};
let licenseSummary = {};
try {
  const raw = execSync('npx -y license-checker --production --json', {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 60_000,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const i = raw.indexOf('{');
  if (i !== -1) licenseData = JSON.parse(raw.slice(i));
} catch (e) {
  const out = e.stdout || '';
  const i = out.indexOf('{');
  if (i !== -1)
    try {
      licenseData = JSON.parse(out.slice(i));
    } catch {
      /* */
    }
}

const licenseEntries = Object.entries(licenseData);
const licenseIssues = [];
for (const [pkg, info] of licenseEntries) {
  const lic = String(info.licenses || 'UNKNOWN').replace(/\*/g, '');
  licenseSummary[lic] = (licenseSummary[lic] || 0) + 1;
  if (pkg.startsWith('leetcode@')) continue;
  const licenseTokens = extractLicenseTokens(lic);
  const hasBlocked = licenseTokens.some((token) => BLOCKED_LICENSES.has(token));
  const hasLGPL = licenseTokens.some((token) => token.startsWith('LGPL-'));
  if (hasBlocked) {
    licenseIssues.push({ pkg, license: lic, type: 'blocked' });
  } else if (hasLGPL) {
    licenseIssues.push({ pkg, license: lic, type: 'attention' });
  }
}
const licenseTotal = licenseEntries.length;
console.log(`  ✅ 扫描 ${licenseTotal} 个包，${licenseIssues.length} 个需关注`);

// ─── 3. 安全响应头 ────────────────────────────────

console.log('🔒 [3/4] 检查安全响应头...');
let headerResults = [];
try {
  const cfg = readFileSync(join(ROOT, 'next.config.ts'), 'utf-8');
  headerResults = REQUIRED_HEADERS.map((h) => ({ header: h, configured: cfg.includes(h) }));
} catch {
  headerResults = REQUIRED_HEADERS.map((h) => ({ header: h, configured: false }));
}
const headersOk = headerResults.filter((r) => r.configured).length;
console.log(`  ✅ ${headersOk}/${headerResults.length} 安全头已配置`);

// ─── 4. 敏感文件 ────────────────────────────────

console.log('🗝️ [4/4] 检测敏感文件...');
let gitignoreContent = '';
try {
  gitignoreContent = readFileSync(join(ROOT, '.gitignore'), 'utf-8');
} catch {
  /* */
}
const gitignoreChecks = [
  { pattern: '.env*', description: '环境变量文件', regex: /\.env\*?/m },
  { pattern: '*.pem', description: 'SSL/TLS 证书', regex: /\*\.pem/m },
  { pattern: '*.key', description: '私钥文件', regex: /\*\.key|\*\.pem/m },
  { pattern: '.vercel', description: 'Vercel 配置', regex: /\.vercel/m },
];
const sensitiveResults = gitignoreChecks.map((c) => ({
  ...c,
  protected: c.regex.test(gitignoreContent),
}));
const envFiles = [];
try {
  for (const f of readdirSync(ROOT)) {
    if (f.startsWith('.env') && f !== '.env.example') envFiles.push(f);
  }
} catch {
  /* */
}
const sensitiveOk = sensitiveResults.filter((r) => r.protected).length;
console.log(`  ✅ ${sensitiveOk}/${sensitiveResults.length} 敏感文件模式已排除`);

// ─── 评分 ────────────────────────────────────────

let score = 100;
score -= vulnCounts.critical * 15;
score -= vulnCounts.high * 5;
score -= vulnCounts.moderate * 2;
score -= vulnCounts.low * 1;
score -= licenseIssues.filter((i) => i.type === 'blocked').length * 10;
score -= (headerResults.length - headersOk) * 10;
score -= sensitiveResults.filter((r) => !r.protected).length * 10;
score = Math.max(0, Math.min(100, score));

function gradeOf(s) {
  if (s >= 90) return { g: 'A', l: '优秀', c: '#0f766e' };
  if (s >= 80) return { g: 'B', l: '良好', c: '#16a34a' };
  if (s >= 60) return { g: 'C', l: '一般', c: '#d97706' };
  if (s >= 40) return { g: 'D', l: '较差', c: '#ea580c' };
  return { g: 'F', l: '危险', c: '#b91c1c' };
}
const grade = gradeOf(score);

// ─── 按模块汇总 ──────────────────────────────────
const byModule = {};
for (const v of vulnDetails) {
  if (!byModule[v.module]) byModule[v.module] = [];
  byModule[v.module].push(v);
}

// ─── 许可证 Top ──────────────────────────────────
const topLicenses = Object.entries(licenseSummary)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

const headerDescriptions = {
  'X-Frame-Options': '防御点击劫持',
  'X-Content-Type-Options': '阻止 MIME 嗅探',
  'Referrer-Policy': '控制 Referer 泄露',
  'Permissions-Policy': '禁用敏感浏览器 API',
  'Strict-Transport-Security': '强制 HTTPS',
  'Content-Security-Policy': '限制资源加载来源',
};

// ═══════════════════════════════════════════════════
// 生成 summary-data.json
// ═══════════════════════════════════════════════════

const summaryData = {
  generatedAtIso: NOW_ISO,
  timestamp: TS,
  score: { value: score, grade: grade.g, label: grade.l },
  vulnerabilities: {
    total: totalVulns,
    totalDependencies: totalDeps,
    counts: vulnCounts,
    details: vulnDetails,
    byModule: Object.fromEntries(
      Object.entries(byModule).map(([m, vs]) => [
        m,
        {
          count: vs.length,
          maxSeverity: vs.reduce(
            (mx, v) => (severityOrder[v.severity] < severityOrder[mx] ? v.severity : mx),
            'info'
          ),
          version: vs[0].version,
          patched: [...new Set(vs.map((v) => v.patched))],
        },
      ])
    ),
  },
  licenses: {
    total: licenseTotal,
    issues: licenseIssues,
    summary: licenseSummary,
  },
  headers: { total: headerResults.length, configured: headersOk, results: headerResults },
  sensitive: {
    total: sensitiveResults.length,
    protected: sensitiveOk,
    results: sensitiveResults.map((r) => ({
      pattern: r.pattern,
      description: r.description,
      protected: r.protected,
    })),
    envFiles,
  },
};

writeFileSync(join(OUT_DIR, 'summary-data.json'), JSON.stringify(summaryData, null, 2), 'utf-8');

// ═══════════════════════════════════════════════════
// 生成 summary.md
// ═══════════════════════════════════════════════════

function sevEmoji(s) {
  return { critical: '🔴', high: '🟠', moderate: '🟡', low: '🔵', info: '⚪' }[s] || '⚪';
}
function sevLabel(s) {
  return { critical: '严重', high: '高危', moderate: '中危', low: '低危', info: '信息' }[s] || s;
}

const md = `# Security Audit Report (${TS})

- Generated at: \`${NOW_ISO}\`
- Audit registry: \`https://registry.npmjs.org\`
- Score: **${score}/100 (${grade.g} ${grade.l})**

## Overview

| 维度 | 状态 | 详情 |
| --- | --- | --- |
| 依赖漏洞 | ${totalVulns === 0 ? '✅' : vulnCounts.critical > 0 || vulnCounts.high > 0 ? '❌' : '⚠️'} | ${totalDeps} 个依赖，${totalVulns} 个漏洞 |
| 许可证合规 | ${licenseIssues.filter((i) => i.type === 'blocked').length === 0 ? '✅' : '❌'} | ${licenseTotal} 个包，${licenseIssues.length} 个需关注 |
| 安全响应头 | ${headersOk === headerResults.length ? '✅' : '❌'} | ${headersOk}/${headerResults.length} 已配置 |
| 敏感文件保护 | ${sensitiveOk === sensitiveResults.length && envFiles.length === 0 ? '✅' : '⚠️'} | ${sensitiveOk}/${sensitiveResults.length} 模式已排除 |

## Vulnerability Counts

| 等级 | 数量 | 占比 |
| --- | ---: | ---: |
| 🔴 Critical | ${vulnCounts.critical} | ${totalVulns ? ((vulnCounts.critical / totalVulns) * 100).toFixed(1) : 0}% |
| 🟠 High | ${vulnCounts.high} | ${totalVulns ? ((vulnCounts.high / totalVulns) * 100).toFixed(1) : 0}% |
| 🟡 Moderate | ${vulnCounts.moderate} | ${totalVulns ? ((vulnCounts.moderate / totalVulns) * 100).toFixed(1) : 0}% |
| 🔵 Low | ${vulnCounts.low} | ${totalVulns ? ((vulnCounts.low / totalVulns) * 100).toFixed(1) : 0}% |

## Affected Packages

| 包名 | 版本 | 漏洞数 | 最高等级 | 修复版本 |
| --- | --- | ---: | --- | --- |
${Object.entries(byModule)
  .map(([m, vs]) => {
    const mx = vs.reduce(
      (mx2, v) => (severityOrder[v.severity] < severityOrder[mx2] ? v.severity : mx2),
      'info'
    );
    return `| \`${m}\` | ${vs[0].version} | ${vs.length} | ${sevEmoji(mx)} ${sevLabel(mx)} | ${[...new Set(vs.map((v) => v.patched))].join(' / ')} |`;
  })
  .join('\n')}

## Vulnerability Details

| Advisory | 包 | 等级 | CVE | CVSS | 标题 |
| --- | --- | --- | --- | ---: | --- |
${vulnDetails.map((v) => `| [${v.id}](${v.url}) | \`${v.module}@${v.version}\` | ${sevEmoji(v.severity)} ${sevLabel(v.severity)} | ${v.cves} | ${v.cvss} | ${v.title} |`).join('\n')}

## License Summary

| 许可证 | 数量 |
| --- | ---: |
${topLicenses.map(([l, c]) => `| ${l} | ${c} |`).join('\n')}

${licenseIssues.length > 0 ? `### Issues\n\n${licenseIssues.map((i) => `- ${i.type === 'blocked' ? '❌' : '⚠️'} **${i.pkg}** — \`${i.license}\``).join('\n')}` : ''}

## Security Headers

| 安全头 | 状态 | 防护作用 |
| --- | --- | --- |
${headerResults.map((r) => `| \`${r.header}\` | ${r.configured ? '✅' : '❌'} | ${headerDescriptions[r.header] || ''} |`).join('\n')}

## Sensitive File Protection

| 模式 | 说明 | 状态 |
| --- | --- | --- |
${sensitiveResults.map((r) => `| \`${r.pattern}\` | ${r.description} | ${r.protected ? '✅' : '❌'} |`).join('\n')}

## Artifacts

- HTML: \`summary.html\`
- JSON: \`summary-data.json\`
`;

writeFileSync(join(OUT_DIR, 'summary.md'), md, 'utf-8');

// ═══════════════════════════════════════════════════
// 生成 summary.html
// ═══════════════════════════════════════════════════

const _sevColor = {
  critical: '#b91c1c',
  high: '#ea580c',
  moderate: '#d97706',
  low: '#2563eb',
  info: '#9ca3af',
};

function vulnTableRows() {
  if (vulnDetails.length === 0) return '<tr><td colspan="6">无漏洞</td></tr>';
  return vulnDetails
    .map(
      (v) => `
      <tr>
        <td class="mono"><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.id)}</a></td>
        <td class="mono">${esc(v.module)}@${esc(v.version)}</td>
        <td><span class="status status-${v.severity}">${sevLabel(v.severity)}</span></td>
        <td class="mono">${esc(v.cves)}</td>
        <td class="mono">${v.cvss}</td>
        <td>${esc(v.title)}</td>
      </tr>`
    )
    .join('');
}

function moduleCards() {
  return Object.entries(byModule)
    .map(([mod, vs]) => {
      const mx = vs.reduce(
        (m, v) => (severityOrder[v.severity] < severityOrder[m] ? v.severity : m),
        'info'
      );
      const patched = [...new Set(vs.map((v) => v.patched))].join(' / ');
      return `
          <article class="card">
            <h2>${esc(mod)}</h2>
            <div class="stat-row"><span>当前版本</span><strong class="mono">${esc(vs[0].version)}</strong></div>
            <div class="stat-row"><span>漏洞数</span><strong>${vs.length}</strong></div>
            <div class="stat-row"><span>最高等级</span><strong><span class="status status-${mx}">${sevLabel(mx)}</span></strong></div>
            <div class="stat-row"><span>修复版本</span><strong class="mono">${esc(patched)}</strong></div>
          </article>`;
    })
    .join('');
}

function licensePie() {
  const total = topLicenses.reduce((s, [, c]) => s + c, 0);
  const colors = [
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#f97316',
  ];
  let offset = 0;
  const segs = topLicenses.map(([_lic, count], i) => {
    const pct = (count / total) * 100;
    const seg = `<circle r="15.9" cx="50" cy="50" fill="transparent" stroke="${colors[i % colors.length]}" stroke-width="8" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="-${offset}" />`;
    offset += pct;
    return seg;
  });
  const legend = topLicenses
    .map(
      ([lic, count], i) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 8px;font-size:11px"><span style="width:10px;height:10px;border-radius:2px;background:${colors[i % colors.length]};display:inline-block"></span>${esc(lic)} (${count})</span>`
    )
    .join('');
  return `<svg viewBox="0 0 100 100" width="140" height="140" style="transform:rotate(-90deg)">${segs.join('')}</svg><div style="margin-top:8px;display:flex;flex-wrap:wrap;justify-content:center">${legend}</div>`;
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Security Audit Report - ${TS}</title>
  <style>
    :root {
      --bg: #f6f7f8;
      --panel: #ffffff;
      --line: #d9dee5;
      --ink: #111827;
      --muted: #6b7280;
      --pass: #0f766e;
      --fail: #b91c1c;
      --warn: #d97706;
      --shadow: 0 14px 36px rgba(17, 24, 39, 0.08);
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    .mono { font-family: "IBM Plex Mono", Consolas, monospace; }
    .shell { max-width: 1200px; margin: 0 auto; padding: 28px 16px 60px; }
    h1 { margin: 0; font-size: clamp(26px, 4vw, 40px); }
    .meta { margin-top: 10px; color: var(--muted); font-size: 13px; display: flex; flex-wrap: wrap; gap: 10px; }
    .cards { margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
    .card h2 { margin: 0 0 8px; font-size: 16px; }
    .stat-row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; color: var(--muted); }
    .stat-row strong { color: var(--ink); }
    .bar-track { margin-top: 10px; height: 10px; border-radius: 999px; background: #eceff3; overflow: hidden; }
    .bar { height: 100%; border-radius: 999px; }
    .panel { margin-top: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow); }
    .panel h3 { margin: 0; padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 15px; }
    .table-wrap { overflow: auto; max-height: 520px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }
    th { position: sticky; top: 0; background: #f3f5f8; z-index: 1; text-transform: uppercase; font-size: 11px; color: #4b5563; letter-spacing: 0.03em; }
    .status { border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-critical { background: rgba(185,28,28,0.14); color: #b91c1c; }
    .status-high { background: rgba(234,88,12,0.14); color: #ea580c; }
    .status-moderate { background: rgba(217,119,6,0.14); color: #d97706; }
    .status-low { background: rgba(37,99,235,0.14); color: #2563eb; }
    .status-pass { background: rgba(15,118,110,0.14); color: var(--pass); }
    .status-fail { background: rgba(185,28,28,0.14); color: var(--fail); }
    .score-ring { text-align: center; padding: 20px; }
    .score-ring svg { display: block; margin: 0 auto; }
    .score-label { font-size: 32px; font-weight: 800; margin-top: 8px; }
    .score-sub { font-size: 14px; color: var(--muted); }
    .pie-chart { text-align: center; padding: 14px; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .check-grid { padding: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; }
    .check-item { border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
    .check-item .name { color: var(--muted); font-size: 12px; }
    .check-item .value { font-size: 16px; font-weight: 700; margin-top: 2px; }
  </style>
</head>
<body>
  <main class="shell">
    <h1>🛡️ Security Audit Report</h1>
    <div class="meta mono">
      <span>Generated: ${esc(NOW_ISO)}</span>
      <span>Dependencies: ${totalDeps}</span>
      <span>Packages: ${licenseTotal}</span>
    </div>

    <section class="cards">
      <!-- 评分卡 -->
      <article class="card">
        <h2>安全评分</h2>
        <div class="score-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#eceff3" stroke-width="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="${grade.c}" stroke-width="10"
              stroke-dasharray="${(score / 100) * 314} 314"
              stroke-linecap="round" transform="rotate(-90 60 60)" />
            <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="800" fill="${grade.c}">${score}</text>
            <text x="60" y="78" text-anchor="middle" font-size="14" fill="#6b7280">${grade.g} · ${grade.l}</text>
          </svg>
        </div>
      </article>

      <!-- 漏洞概览卡 -->
      <article class="card">
        <h2>依赖漏洞</h2>
        <div class="stat-row"><span>扫描依赖</span><strong>${totalDeps}</strong></div>
        <div class="stat-row"><span>发现漏洞</span><strong>${totalVulns}</strong></div>
        <div class="stat-row"><span>🔴 Critical</span><strong>${vulnCounts.critical}</strong></div>
        <div class="stat-row"><span>🟠 High</span><strong>${vulnCounts.high}</strong></div>
        <div class="stat-row"><span>🟡 Moderate</span><strong>${vulnCounts.moderate}</strong></div>
        <div class="stat-row"><span>🔵 Low</span><strong>${vulnCounts.low}</strong></div>
        <div class="bar-track"><div class="bar" style="width:${totalDeps ? ((totalDeps - totalVulns) / totalDeps) * 100 : 100}%;background:linear-gradient(90deg,${totalVulns > 0 ? '#ea580c,#d97706' : '#0f766e,#16a34a'})"></div></div>
      </article>

      <!-- 许可证卡 -->
      <article class="card">
        <h2>许可证合规</h2>
        <div class="stat-row"><span>扫描包数</span><strong>${licenseTotal}</strong></div>
        <div class="stat-row"><span>合规</span><strong>${licenseTotal - licenseIssues.length}</strong></div>
        <div class="stat-row"><span>需关注</span><strong>${licenseIssues.length}</strong></div>
        <div class="stat-row"><span>合规率</span><strong>${licenseTotal ? ((1 - licenseIssues.length / licenseTotal) * 100).toFixed(1) : 100}%</strong></div>
        <div class="bar-track"><div class="bar" style="width:${licenseTotal ? (1 - licenseIssues.length / licenseTotal) * 100 : 100}%;background:linear-gradient(90deg,#0f766e,#16a34a)"></div></div>
      </article>

      <!-- 安全头卡 -->
      <article class="card">
        <h2>安全响应头</h2>
        <div class="stat-row"><span>要求</span><strong>${headerResults.length}</strong></div>
        <div class="stat-row"><span>已配置</span><strong>${headersOk}</strong></div>
        <div class="stat-row"><span>覆盖率</span><strong>${((headersOk / headerResults.length) * 100).toFixed(0)}%</strong></div>
        <div class="bar-track"><div class="bar" style="width:${(headersOk / headerResults.length) * 100}%;background:linear-gradient(90deg,#0f766e,#16a34a)"></div></div>
      </article>
    </section>

    <!-- 受影响包 -->
    <section class="cards">
      ${moduleCards()}
    </section>

    <!-- 漏洞详情表 -->
    <section class="panel">
      <h3>漏洞详情 (${vulnDetails.length})</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Advisory</th><th>包</th><th>等级</th><th>CVE</th><th>CVSS</th><th>标题</th></tr></thead>
          <tbody>${vulnTableRows()}</tbody>
        </table>
      </div>
    </section>

    <!-- 许可证分布 -->
    <section class="panel">
      <h3>许可证分布</h3>
      <div class="pie-chart">
        ${licensePie()}
      </div>
    </section>

    ${
      licenseIssues.length > 0
        ? `
    <section class="panel">
      <h3>许可证问题 (${licenseIssues.length})</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>包名</th><th>许可证</th><th>类型</th></tr></thead>
          <tbody>${licenseIssues
            .map(
              (i) => `
            <tr>
              <td class="mono">${esc(i.pkg)}</td>
              <td class="mono">${esc(i.license)}</td>
              <td><span class="status ${i.type === 'blocked' ? 'status-fail' : 'status-moderate'}">${i.type === 'blocked' ? '不兼容' : '需注意'}</span></td>
            </tr>`
            )
            .join('')}
          </tbody>
        </table>
      </div>
    </section>`
        : ''
    }

    <!-- 安全头检查 -->
    <section class="panel">
      <h3>安全响应头配置</h3>
      <div class="check-grid">
        ${headerResults
          .map(
            (r) => `
          <div class="check-item">
            <div class="name">${esc(r.header)}</div>
            <div class="value">${r.configured ? '✅ 已配置' : '❌ 缺失'}</div>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <!-- 敏感文件保护 -->
    <section class="panel">
      <h3>敏感文件保护</h3>
      <div class="check-grid">
        ${sensitiveResults
          .map(
            (r) => `
          <div class="check-item">
            <div class="name">${esc(r.pattern)} — ${esc(r.description)}</div>
            <div class="value">${r.protected ? '✅ 已排除' : '❌ 未排除'}</div>
          </div>`
          )
          .join('')}
      </div>
    </section>
  </main>
</body>
</html>`;

writeFileSync(join(OUT_DIR, 'summary.html'), html, 'utf-8');

// ─── 完成 ────────────────────────────────────────

console.log(`\n✨ 审计报告已生成：`);
console.log(`   📁 ${OUT_DIR}`);
console.log(`   📄 summary.html  (可视化页面)`);
console.log(`   📄 summary.md    (Markdown 摘要)`);
console.log(`   📄 summary-data.json (原始数据)`);
console.log(`   🏆 安全评分：${score}/100（${grade.g} ${grade.l}）`);

if (CI_MODE && (vulnCounts.critical > 0 || vulnCounts.high > 0)) {
  console.log(
    `\n❌ CI: ${vulnCounts.critical + vulnCounts.high} 个 high/critical 漏洞，审计不通过`
  );
  process.exit(1);
}
