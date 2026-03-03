#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    args[key] = value;
  }
  return args;
}

function toStamp(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}${mi}${ss}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function htmlEscape(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toMs(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;
}

function parseVitestReport(report) {
  if (!report) return null;

  const suiteResults = Array.isArray(report.testResults) ? report.testResults : [];
  const tests = [];

  for (const suite of suiteResults) {
    const suiteFile = typeof suite.name === 'string' ? suite.name : 'unknown';
    const assertions = Array.isArray(suite.assertionResults) ? suite.assertionResults : [];

    for (const assertion of assertions) {
      const titles = Array.isArray(assertion.ancestorTitles) ? assertion.ancestorTitles : [];
      const status = assertion.status === 'pending' ? 'skipped' : (assertion.status ?? 'unknown');
      tests.push({
        file: suiteFile,
        title: [...titles, assertion.title].filter(Boolean).join(' > '),
        status,
        durationMs: toMs(assertion.duration),
        error:
          Array.isArray(assertion.failureMessages) && assertion.failureMessages.length > 0
            ? assertion.failureMessages.join('\n')
            : null,
      });
    }
  }

  const passed =
    typeof report.numPassedTests === 'number'
      ? report.numPassedTests
      : tests.filter((t) => t.status === 'passed').length;
  const failed =
    typeof report.numFailedTests === 'number'
      ? report.numFailedTests
      : tests.filter((t) => t.status === 'failed').length;
  const skipped =
    typeof report.numPendingTests === 'number'
      ? report.numPendingTests
      : tests.filter((t) => t.status === 'skipped').length;
  const total = typeof report.numTotalTests === 'number' ? report.numTotalTests : tests.length;
  const durationMs = tests.reduce((sum, t) => sum + t.durationMs, 0);

  return {
    total,
    passed,
    failed,
    skipped,
    durationMs,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    tests,
  };
}

function collectPlaywrightSpecs(suites, parentTitles = []) {
  const rows = [];
  const safeSuites = Array.isArray(suites) ? suites : [];

  for (const suite of safeSuites) {
    const currentTitles = [...parentTitles, suite.title].filter(Boolean);
    const specs = Array.isArray(suite.specs) ? suite.specs : [];

    for (const spec of specs) {
      const specTests = Array.isArray(spec.tests) ? spec.tests : [];
      const results = specTests.flatMap((t) => (Array.isArray(t.results) ? t.results : []));

      let status = 'skipped';
      if (results.some((r) => ['failed', 'timedOut', 'interrupted'].includes(r.status))) {
        status = 'failed';
      } else if (results.some((r) => r.status === 'passed')) {
        status = 'passed';
      }

      const error = results
        .map((r) => r?.error?.message)
        .filter((message) => typeof message === 'string' && message.length > 0)
        .join('\n');

      rows.push({
        file: spec.file ?? suite.file ?? '',
        title: [...currentTitles, spec.title].filter(Boolean).join(' > '),
        status,
        durationMs: toMs(results.reduce((sum, r) => sum + toMs(r.duration), 0)),
        error: error || null,
      });
    }

    rows.push(...collectPlaywrightSpecs(suite.suites, currentTitles));
  }

  return rows;
}

function parsePlaywrightReport(report) {
  if (!report) return null;
  const tests = collectPlaywrightSpecs(report.suites);
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  const total = tests.length;

  const statsDuration =
    report?.stats && typeof report.stats.duration === 'number' ? toMs(report.stats.duration) : null;
  const durationMs = statsDuration ?? tests.reduce((sum, t) => sum + t.durationMs, 0);

  return {
    total,
    passed,
    failed,
    skipped,
    durationMs,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    tests,
  };
}

function parseCoverageSummary(report) {
  if (!report?.total) return null;
  const total = report.total;
  return {
    linesPct: total.lines?.pct ?? null,
    functionsPct: total.functions?.pct ?? null,
    branchesPct: total.branches?.pct ?? null,
    statementsPct: total.statements?.pct ?? null,
  };
}

function fmtPct(value) {
  return typeof value === 'number' ? `${value.toFixed(1)}%` : '-';
}

function fmtMs(value) {
  return typeof value === 'number' ? `${value}ms` : '-';
}

function covEmoji(pct) {
  if (typeof pct !== 'number') return '⚪';
  if (pct >= 80) return '✅';
  if (pct >= 50) return '🟡';
  return '❌';
}

function statusEmoji(rate) {
  if (typeof rate !== 'number') return '⚪';
  if (rate >= 100) return '✅';
  if (rate >= 80) return '🟡';
  return '❌';
}

function groupTestsByFile(tests) {
  const map = new Map();
  for (const t of tests) {
    const base = t.file ? path.basename(t.file) : 'unknown';
    if (!map.has(base))
      map.set(base, { file: base, total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 });
    const g = map.get(base);
    g.total++;
    if (t.status === 'passed') g.passed++;
    else if (t.status === 'failed') g.failed++;
    else g.skipped++;
    g.durationMs += t.durationMs;
  }
  return [...map.values()].sort((a, b) => b.durationMs - a.durationMs);
}

function renderMarkdown(summary, context) {
  const lines = [];
  lines.push(`# Test Workflow Report (${context.stamp})`);
  lines.push('');
  lines.push(`- Generated at: \`${context.generatedAtIso}\``);
  lines.push(`- Unit source: \`${context.vitestPath}\``);
  lines.push(`- E2E source: \`${context.playwrightPath}\``);
  lines.push(`- Coverage source: \`${context.coveragePath}\``);
  lines.push('');

  // 总览
  const allTests = [...(summary.unit?.tests ?? []), ...(summary.e2e?.tests ?? [])];
  const totalAll = allTests.length;
  const passedAll = allTests.filter((t) => t.status === 'passed').length;
  const durationAll = allTests.reduce((s, t) => s + t.durationMs, 0);
  const passRateAll = totalAll > 0 ? (passedAll / totalAll) * 100 : 0;

  lines.push('## Overview');
  lines.push('');
  lines.push(
    `${statusEmoji(passRateAll)} **Overall: ${passedAll}/${totalAll} passed (${fmtPct(passRateAll)}) in ${fmtMs(durationAll)}**`
  );
  lines.push('');
  lines.push('| Suite | Total | Passed | Failed | Skipped | Pass Rate | Duration |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');

  for (const suite of ['unit', 'e2e']) {
    const item = summary[suite];
    if (!item) {
      lines.push(`| ${suite} | - | - | - | - | - | - |`);
      continue;
    }
    lines.push(
      `| ${statusEmoji(item.passRate)} ${suite} | ${item.total} | ${item.passed} | ${item.failed} | ${item.skipped} | ${fmtPct(
        item.passRate
      )} | ${fmtMs(item.durationMs)} |`
    );
  }

  // 覆盖率
  lines.push('');
  lines.push('## Coverage');
  lines.push('');
  lines.push('| Metric | Value | Status |');
  lines.push('| --- | ---: | --- |');
  lines.push(
    `| Lines | ${fmtPct(summary.coverage?.linesPct)} | ${covEmoji(summary.coverage?.linesPct)} |`
  );
  lines.push(
    `| Functions | ${fmtPct(summary.coverage?.functionsPct)} | ${covEmoji(summary.coverage?.functionsPct)} |`
  );
  lines.push(
    `| Branches | ${fmtPct(summary.coverage?.branchesPct)} | ${covEmoji(summary.coverage?.branchesPct)} |`
  );
  lines.push(
    `| Statements | ${fmtPct(summary.coverage?.statementsPct)} | ${covEmoji(summary.coverage?.statementsPct)} |`
  );
  lines.push('');

  // 按文件分组
  const fileGroups = groupTestsByFile(allTests);
  if (fileGroups.length > 0) {
    lines.push('## Test Distribution by File');
    lines.push('');
    lines.push('| File | Total | Passed | Failed | Duration |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const g of fileGroups) {
      lines.push(
        `| \`${g.file}\` | ${g.total} | ${g.passed} | ${g.failed} | ${fmtMs(g.durationMs)} |`
      );
    }
    lines.push('');
  }

  // 失败测试
  const failedTests = allTests.filter((t) => t.status === 'failed');

  lines.push('## Failed Tests');
  lines.push('');

  if (failedTests.length === 0) {
    lines.push('- None');
  } else {
    for (const test of failedTests) {
      lines.push(`- \`${test.file}\` - ${test.title}`);
      if (test.error) {
        lines.push(`  - ${test.error.split('\n')[0]}`);
      }
    }
  }

  const renderDetailTable = (title, tests) => {
    lines.push('');
    lines.push(`## ${title}`);
    lines.push('');
    if (!tests || tests.length === 0) {
      lines.push('- None');
      return;
    }

    lines.push('| File | Title | Status | Duration |');
    lines.push('| --- | --- | --- | ---: |');
    for (const test of tests) {
      lines.push(
        `| \`${test.file || '-'}\` | ${test.title || '-'} | ${test.status} | ${fmtMs(test.durationMs)} |`
      );
    }
  };

  renderDetailTable('Unit Test Details', summary.unit?.tests ?? []);
  renderDetailTable('E2E Test Details', summary.e2e?.tests ?? []);

  const slowTests = allTests.sort((a, b) => b.durationMs - a.durationMs).slice(0, 10);

  lines.push('');
  lines.push('## Slowest Tests (Top 10)');
  lines.push('');
  if (slowTests.length === 0) {
    lines.push('- None');
  } else {
    lines.push('| File | Title | Duration |');
    lines.push('| --- | --- | ---: |');
    for (const test of slowTests) {
      lines.push(`| \`${test.file || '-'}\` | ${test.title || '-'} | ${fmtMs(test.durationMs)} |`);
    }
  }

  lines.push('');
  lines.push('## Artifacts');
  lines.push('');
  lines.push(`- HTML: \`${context.htmlFileName}\``);
  lines.push(`- JSON: \`${context.dataFileName}\``);
  lines.push('');
  return lines.join('\n');
}

function renderRows(rows) {
  return rows
    .map(
      (row) => `
      <tr>
        <td class="mono">${htmlEscape(row.file || '-')}</td>
        <td>${htmlEscape(row.title || '-')}</td>
        <td><span class="status status-${htmlEscape(row.status)}">${htmlEscape(row.status)}</span></td>
        <td class="mono">${fmtMs(row.durationMs)}</td>
      </tr>
      `
    )
    .join('');
}

function renderHtml(summary, context) {
  const allTests = [...(summary.unit?.tests ?? []), ...(summary.e2e?.tests ?? [])];
  const failedTests = allTests.filter((t) => t.status === 'failed');
  const slowTests = [...allTests].sort((a, b) => b.durationMs - a.durationMs).slice(0, 15);

  const totalAll = allTests.length;
  const passedAll = allTests.filter((t) => t.status === 'passed').length;
  const failedAll = failedTests.length;
  const skippedAll = allTests.filter((t) => t.status === 'skipped').length;
  const durationAll = allTests.reduce((s, t) => s + t.durationMs, 0);
  const passRateAll = totalAll > 0 ? (passedAll / totalAll) * 100 : 0;

  const suites = [
    { key: 'unit', label: 'Unit Tests', data: summary.unit },
    { key: 'e2e', label: 'E2E Smoke', data: summary.e2e },
  ];

  // 按文件分组
  const fileGroups = groupTestsByFile(allTests);
  const maxFileDuration = Math.max(1, ...fileGroups.map((g) => g.durationMs));

  // 覆盖率辅助
  function covBar(pct) {
    if (typeof pct !== 'number') return '';
    const color = pct >= 80 ? '#0f766e' : pct >= 50 ? '#d97706' : '#b91c1c';
    return `<div class="bar-track" style="margin-top:6px"><div class="bar" style="width:${Math.min(100, pct)}%;background:${color}"></div></div>`;
  }

  // 评分环
  const scoreColor =
    passRateAll >= 100
      ? '#0f766e'
      : passRateAll >= 80
        ? '#16a34a'
        : passRateAll >= 50
          ? '#d97706'
          : '#b91c1c';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Test Workflow Report - ${htmlEscape(context.stamp)}</title>
  <style>
    :root {
      --bg: #f6f7f8;
      --panel: #ffffff;
      --line: #d9dee5;
      --ink: #111827;
      --muted: #6b7280;
      --pass: #0f766e;
      --fail: #b91c1c;
      --skip: #9ca3af;
      --shadow: 0 14px 36px rgba(17, 24, 39, 0.08);
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    .mono { font-family: "IBM Plex Mono", Consolas, monospace; }
    .shell { max-width: 1200px; margin: 0 auto; padding: 28px 16px 60px; }
    h1 { margin: 0; font-size: clamp(26px, 4vw, 40px); }
    .meta { margin-top: 10px; color: var(--muted); font-size: 13px; display: flex; flex-wrap: wrap; gap: 10px; }
    .cards { margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
    .card h2 { margin: 0 0 8px; font-size: 16px; }
    .stat-row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; color: var(--muted); }
    .stat-row strong { color: var(--ink); }
    .bar-track { margin-top: 10px; height: 10px; border-radius: 999px; background: #eceff3; overflow: hidden; }
    .bar { height: 100%; background: linear-gradient(90deg, #0f766e, #16a34a); border-radius: 999px; }
    .panel { margin-top: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow); }
    .panel h3 { margin: 0; padding: 12px 14px; border-bottom: 1px solid var(--line); font-size: 15px; }
    .table-wrap { overflow: auto; max-height: 520px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }
    th { position: sticky; top: 0; background: #f3f5f8; z-index: 1; text-transform: uppercase; font-size: 11px; color: #4b5563; letter-spacing: 0.03em; }
    .status { border-radius: 999px; padding: 2px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-passed { background: rgba(15,118,110,0.14); color: var(--pass); }
    .status-failed { background: rgba(185,28,28,0.14); color: var(--fail); }
    .status-skipped { background: rgba(107,114,128,0.14); color: var(--skip); }
    .coverage { padding: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
    .coverage-item { border: 1px solid var(--line); border-radius: 10px; padding: 10px; }
    .coverage-item .name { color: var(--muted); font-size: 12px; }
    .coverage-item .value { font-size: 20px; font-weight: 700; margin-top: 2px; }
    .score-ring { text-align: center; padding: 12px 0; }
    .file-bar { display: flex; align-items: center; gap: 8px; padding: 6px 14px; }
    .file-bar:nth-child(odd) { background: rgba(18,24,33,0.02); }
    .file-bar .fname { width: 200px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-bar .fbar { flex: 1; height: 8px; border-radius: 999px; background: #eceff3; overflow: hidden; }
    .file-bar .fbar-inner { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #0f766e, #16a34a); }
    .file-bar .fstats { width: 180px; font-size: 11px; color: var(--muted); text-align: right; }
  </style>
</head>
<body>
  <main class="shell">
    <h1>Test Workflow Report</h1>
    <div class="meta mono">
      <span>Generated: ${htmlEscape(context.generatedAtIso)}</span>
      <span>Unit: ${htmlEscape(context.vitestPath)}</span>
      <span>E2E: ${htmlEscape(context.playwrightPath)}</span>
    </div>

    <section class="cards">
      <!-- 总览卡 -->
      <article class="card">
        <h2>Overall</h2>
        <div class="score-ring">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#eceff3" stroke-width="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="${scoreColor}" stroke-width="8"
              stroke-dasharray="${(passRateAll / 100) * 251} 251"
              stroke-linecap="round" transform="rotate(-90 50 50)" />
            <text x="50" y="48" text-anchor="middle" font-size="18" font-weight="800" fill="${scoreColor}">${passedAll}/${totalAll}</text>
            <text x="50" y="64" text-anchor="middle" font-size="11" fill="#6b7280">${fmtPct(passRateAll)}</text>
          </svg>
        </div>
        <div class="stat-row"><span>Duration</span><strong>${fmtMs(durationAll)}</strong></div>
        <div class="stat-row"><span>Failed</span><strong style="color:${failedAll > 0 ? 'var(--fail)' : 'inherit'}">${failedAll}</strong></div>
        <div class="stat-row"><span>Skipped</span><strong>${skippedAll}</strong></div>
      </article>

      ${suites
        .map((suite) => {
          const data = suite.data;
          return `
          <article class="card">
            <h2>${suite.label}</h2>
            ${
              !data
                ? '<div class="stat-row"><span>No report found</span><strong>-</strong></div>'
                : `
                  <div class="stat-row"><span>Total</span><strong>${data.total}</strong></div>
                  <div class="stat-row"><span>Passed</span><strong>${data.passed}</strong></div>
                  <div class="stat-row"><span>Failed</span><strong>${data.failed}</strong></div>
                  <div class="stat-row"><span>Skipped</span><strong>${data.skipped}</strong></div>
                  <div class="stat-row"><span>Duration</span><strong>${fmtMs(data.durationMs)}</strong></div>
                  <div class="stat-row"><span>Pass Rate</span><strong>${fmtPct(data.passRate)}</strong></div>
                  <div class="bar-track"><div class="bar" style="width:${Math.max(
                    0,
                    Math.min(100, data.passRate ?? 0)
                  )}%"></div></div>
                `
            }
          </article>
          `;
        })
        .join('')}
    </section>

    <section class="panel">
      <h3>Coverage</h3>
      <div class="coverage">
        <div class="coverage-item">
          <div class="name">Lines</div>
          <div class="value mono">${fmtPct(summary.coverage?.linesPct)}</div>
          ${covBar(summary.coverage?.linesPct)}
        </div>
        <div class="coverage-item">
          <div class="name">Functions</div>
          <div class="value mono">${fmtPct(summary.coverage?.functionsPct)}</div>
          ${covBar(summary.coverage?.functionsPct)}
        </div>
        <div class="coverage-item">
          <div class="name">Branches</div>
          <div class="value mono">${fmtPct(summary.coverage?.branchesPct)}</div>
          ${covBar(summary.coverage?.branchesPct)}
        </div>
        <div class="coverage-item">
          <div class="name">Statements</div>
          <div class="value mono">${fmtPct(summary.coverage?.statementsPct)}</div>
          ${covBar(summary.coverage?.statementsPct)}
        </div>
      </div>
    </section>

    ${
      fileGroups.length > 0
        ? `
    <section class="panel">
      <h3>Test Distribution by File (${fileGroups.length} files)</h3>
      <div style="padding:8px 0">
        ${fileGroups
          .map(
            (g) => `
          <div class="file-bar">
            <div class="fname mono">${htmlEscape(g.file)}</div>
            <div class="fbar"><div class="fbar-inner" style="width:${Math.round((g.durationMs / maxFileDuration) * 100)}%"></div></div>
            <div class="fstats mono">${g.passed}/${g.total} passed · ${fmtMs(g.durationMs)}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>`
        : ''
    }

    <section class="panel">
      <h3>Failed Tests (${failedTests.length})</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>File</th><th>Title</th><th>Status</th><th>Duration</th></tr></thead>
          <tbody>${failedTests.length ? renderRows(failedTests) : '<tr><td colspan="4">No failed tests</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h3>Slowest Tests (Top ${slowTests.length})</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>File</th><th>Title</th><th>Status</th><th>Duration</th></tr></thead>
          <tbody>${slowTests.length ? renderRows(slowTests) : '<tr><td colspan="4">No tests found</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const vitestPath = path.resolve(args.vitest ?? 'test-results/vitest/results.json');
  const playwrightPath = path.resolve(args.playwright ?? 'test-results/playwright/results.json');
  const coveragePath = path.resolve(args.coverage ?? 'coverage/coverage-summary.json');
  const stamp = toStamp();
  const outDir = path.resolve(args.outDir ?? path.join('docs/testing/reports', stamp));
  const markdownFileName = args.markdown ?? 'summary.md';
  const htmlFileName = args.html ?? 'summary.html';
  const dataFileName = args.data ?? 'summary-data.json';
  const generatedAtIso = new Date().toISOString();

  ensureDir(outDir);

  const summary = {
    unit: parseVitestReport(readJsonIfExists(vitestPath)),
    e2e: parsePlaywrightReport(readJsonIfExists(playwrightPath)),
    coverage: parseCoverageSummary(readJsonIfExists(coveragePath)),
  };

  const context = {
    stamp,
    generatedAtIso,
    vitestPath: path.relative(process.cwd(), vitestPath).replaceAll('\\', '/'),
    playwrightPath: path.relative(process.cwd(), playwrightPath).replaceAll('\\', '/'),
    coveragePath: path.relative(process.cwd(), coveragePath).replaceAll('\\', '/'),
    htmlFileName,
    dataFileName,
  };

  const markdown = renderMarkdown(summary, context);
  const html = renderHtml(summary, context);

  const markdownPath = path.join(outDir, markdownFileName);
  const htmlPath = path.join(outDir, htmlFileName);
  const dataPath = path.join(outDir, dataFileName);

  fs.writeFileSync(markdownPath, markdown, 'utf8');
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync(
    dataPath,
    JSON.stringify(
      {
        generatedAtIso,
        vitestPath: context.vitestPath,
        playwrightPath: context.playwrightPath,
        coveragePath: context.coveragePath,
        summary,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `Test summary generated: ${path.relative(process.cwd(), markdownPath).replaceAll('\\', '/')}`
  );
  console.log(
    `Test visualization generated: ${path.relative(process.cwd(), htmlPath).replaceAll('\\', '/')}`
  );
  console.log(
    `Test data generated: ${path.relative(process.cwd(), dataPath).replaceAll('\\', '/')}`
  );
}

main();
