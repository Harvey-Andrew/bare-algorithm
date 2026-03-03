#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const routeFallbackMap = {
  home: '/',
  problems: '/problems',
  'category-array': '/problems/array',
  'problem-two-sum': '/problems/array/two-sum',
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    if (token.includes('=')) {
      const [k, v] = token.split('=');
      args[k.slice(2)] = v ?? '';
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[token.slice(2)] = next;
      i += 1;
    } else {
      args[token.slice(2)] = 'true';
    }
  }
  return args;
}

function toLocalDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function hasJsonFiles(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .some((entry) => entry.isFile() && entry.name.endsWith('.json'));
}

function resolveReportSourceDir(dirPath, label) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`${label} dir does not exist: ${dirPath}`);
  }

  if (hasJsonFiles(dirPath)) {
    return dirPath;
  }

  const subDirs = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const subDirName of subDirs) {
    const candidateDir = path.join(dirPath, subDirName);
    if (!hasJsonFiles(candidateDir)) continue;
    console.log(
      `No JSON files found in ${label} root, using latest run directory: ${path.relative(process.cwd(), candidateDir).replaceAll('\\', '/')}`
    );
    return candidateDir;
  }

  throw new Error(
    `No JSON reports found in ${label} dir: ${dirPath}. Expected JSON files in this directory or its direct run subdirectories.`
  );
}

function listJsonFileNames(dirPath) {
  const names = new Set();
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.json')) continue;
    names.add(entry.name);
  }
  return names;
}

function safeReadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readResourceValue(json, resourceType, fieldName) {
  const items = json?.audits?.['resource-summary']?.details?.items;
  if (!Array.isArray(items)) return null;
  const item = items.find((it) => it?.resourceType === resourceType);
  if (!item) return null;
  return asNumber(item[fieldName]);
}

function resolveRoute(report, fileNameNoExt) {
  const urlValue = report?.finalUrl ?? report?.requestedUrl;
  if (typeof urlValue === 'string' && urlValue.length > 0) {
    try {
      const parsed = new URL(urlValue);
      return parsed.pathname || '/';
    } catch {
      // ignore URL parse failures and fallback.
    }
  }
  return routeFallbackMap[fileNameNoExt] ?? `/${fileNameNoExt}`;
}

function extractMetrics(report) {
  const scoreRaw = asNumber(report?.categories?.performance?.score);
  return {
    score: scoreRaw === null ? null : Math.round(scoreRaw * 100),
    fcp: rounded(report?.audits?.['first-contentful-paint']?.numericValue),
    lcp: rounded(report?.audits?.['largest-contentful-paint']?.numericValue),
    speedIndex: rounded(report?.audits?.['speed-index']?.numericValue),
    tbt: rounded(report?.audits?.['total-blocking-time']?.numericValue),
    cls: roundedFloat(report?.audits?.['cumulative-layout-shift']?.numericValue, 3),
    transferKB: toKB(readResourceValue(report, 'total', 'transferSize')),
    scriptKB: toKB(readResourceValue(report, 'script', 'transferSize')),
    requestCount: asNumber(readResourceValue(report, 'total', 'requestCount')),
  };
}

function rounded(value) {
  const n = asNumber(value);
  return n === null ? null : Math.round(n);
}

function roundedFloat(value, digits) {
  const n = asNumber(value);
  return n === null ? null : Number(n.toFixed(digits));
}

function toKB(byteValue) {
  const n = asNumber(byteValue);
  return n === null ? null : Math.round(n / 1024);
}

function delta(base, optimized) {
  if (base === null || optimized === null) return null;
  return optimized - base;
}

function average(values) {
  const valid = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, v) => acc + v, 0);
  return sum / valid.length;
}

function fmtInt(value, suffix = '') {
  return value === null ? '-' : `${Math.round(value)}${suffix}`;
}

function fmtFloat(value, digits = 2, suffix = '') {
  return value === null ? '-' : `${value.toFixed(digits)}${suffix}`;
}

function fmtSigned(value, suffix = '') {
  if (value === null) return '-';
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? '+' : ''}${Math.round(value)}${suffix}`;
}

function fmtSignedFloat(value, digits = 3) {
  if (value === null) return '-';
  if (value === 0) return '0';
  const abs = Math.abs(value).toFixed(digits);
  return `${value > 0 ? '+' : '-'}${abs}`;
}

function htmlEscape(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function byRoutePath(a, b) {
  return a.route.localeCompare(b.route);
}

function buildRows(commonFileNames, baselineDir, optimizedDir) {
  const rows = [];

  for (const fileName of commonFileNames) {
    const baselinePath = path.join(baselineDir, fileName);
    const optimizedPath = path.join(optimizedDir, fileName);

    const baselineReport = safeReadJson(baselinePath);
    const optimizedReport = safeReadJson(optimizedPath);
    const fileNameNoExt = fileName.replace(/\.json$/, '');

    const baselineMetrics = extractMetrics(baselineReport);
    const optimizedMetrics = extractMetrics(optimizedReport);

    rows.push({
      fileName,
      route: resolveRoute(optimizedReport, fileNameNoExt),
      baseline: baselineMetrics,
      optimized: optimizedMetrics,
      delta: {
        score: delta(baselineMetrics.score, optimizedMetrics.score),
        fcp: delta(baselineMetrics.fcp, optimizedMetrics.fcp),
        lcp: delta(baselineMetrics.lcp, optimizedMetrics.lcp),
        speedIndex: delta(baselineMetrics.speedIndex, optimizedMetrics.speedIndex),
        tbt: delta(baselineMetrics.tbt, optimizedMetrics.tbt),
        cls:
          baselineMetrics.cls === null || optimizedMetrics.cls === null
            ? null
            : Number((optimizedMetrics.cls - baselineMetrics.cls).toFixed(3)),
        transferKB: delta(baselineMetrics.transferKB, optimizedMetrics.transferKB),
        scriptKB: delta(baselineMetrics.scriptKB, optimizedMetrics.scriptKB),
      },
    });
  }

  rows.sort(byRoutePath);
  return rows;
}

function pickBest(rows, field, direction) {
  const valid = rows
    .map((row) => ({ route: row.route, value: row.delta[field] }))
    .filter((entry) => typeof entry.value === 'number');
  if (valid.length === 0) return null;

  valid.sort((a, b) => (direction === 'min' ? a.value - b.value : b.value - a.value));
  return valid[0];
}

function buildSummary(rows) {
  return {
    avgBaselineScore: rounded(average(rows.map((row) => row.baseline.score))),
    avgOptimizedScore: rounded(average(rows.map((row) => row.optimized.score))),
    avgBaselineLcp: rounded(average(rows.map((row) => row.baseline.lcp))),
    avgOptimizedLcp: rounded(average(rows.map((row) => row.optimized.lcp))),
    avgBaselineTbt: rounded(average(rows.map((row) => row.baseline.tbt))),
    avgOptimizedTbt: rounded(average(rows.map((row) => row.optimized.tbt))),
    avgBaselineTransferKB: rounded(average(rows.map((row) => row.baseline.transferKB))),
    avgOptimizedTransferKB: rounded(average(rows.map((row) => row.optimized.transferKB))),
    avgBaselineFcp: rounded(average(rows.map((row) => row.baseline.fcp))),
    avgOptimizedFcp: rounded(average(rows.map((row) => row.optimized.fcp))),
    avgBaselineSpeedIndex: rounded(average(rows.map((row) => row.baseline.speedIndex))),
    avgOptimizedSpeedIndex: rounded(average(rows.map((row) => row.optimized.speedIndex))),
    avgBaselineScriptKB: rounded(average(rows.map((row) => row.baseline.scriptKB))),
    avgOptimizedScriptKB: rounded(average(rows.map((row) => row.optimized.scriptKB))),
    avgBaselineRequests: rounded(average(rows.map((row) => row.baseline.requestCount))),
    avgOptimizedRequests: rounded(average(rows.map((row) => row.optimized.requestCount))),
    bestScoreGain: pickBest(rows, 'score', 'max'),
    bestLcpDrop: pickBest(rows, 'lcp', 'min'),
    bestTbtDrop: pickBest(rows, 'tbt', 'min'),
    bestTransferDrop: pickBest(rows, 'transferKB', 'min'),
    bestFcpDrop: pickBest(rows, 'fcp', 'min'),
    bestSpeedIndexDrop: pickBest(rows, 'speedIndex', 'min'),
    bestScriptDrop: pickBest(rows, 'scriptKB', 'min'),
  };
}

function scoreEmoji(score) {
  if (score === null) return '⚪';
  if (score >= 90) return '✅';
  if (score >= 60) return '🟡';
  return '❌';
}

function renderMarkdown(rows, summary, context) {
  const lines = [];
  lines.push(`# Performance Visual Summary (${context.dateStamp})`);
  lines.push('');
  lines.push(`- Baseline: \`${context.baselineDir}\``);
  lines.push(`- Optimized: \`${context.optimizedDir}\``);
  lines.push(`- Generated at: \`${context.generatedAtIso}\``);
  lines.push(`- Visualization: \`${context.htmlFileName}\``);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('| Metric | Baseline | Optimized | Delta |');
  lines.push('| --- | ---: | ---: | ---: |');
  lines.push(
    `| ${scoreEmoji(summary.avgOptimizedScore)} Score | ${fmtInt(summary.avgBaselineScore)} | ${fmtInt(summary.avgOptimizedScore)} | ${fmtSigned(delta(summary.avgBaselineScore, summary.avgOptimizedScore))} |`
  );
  lines.push(
    `| FCP | ${fmtInt(summary.avgBaselineFcp, 'ms')} | ${fmtInt(summary.avgOptimizedFcp, 'ms')} | ${fmtSigned(delta(summary.avgBaselineFcp, summary.avgOptimizedFcp), 'ms')} |`
  );
  lines.push(
    `| LCP | ${fmtInt(summary.avgBaselineLcp, 'ms')} | ${fmtInt(summary.avgOptimizedLcp, 'ms')} | ${fmtSigned(delta(summary.avgBaselineLcp, summary.avgOptimizedLcp), 'ms')} |`
  );
  lines.push(
    `| Speed Index | ${fmtInt(summary.avgBaselineSpeedIndex, 'ms')} | ${fmtInt(summary.avgOptimizedSpeedIndex, 'ms')} | ${fmtSigned(delta(summary.avgBaselineSpeedIndex, summary.avgOptimizedSpeedIndex), 'ms')} |`
  );
  lines.push(
    `| TBT | ${fmtInt(summary.avgBaselineTbt, 'ms')} | ${fmtInt(summary.avgOptimizedTbt, 'ms')} | ${fmtSigned(delta(summary.avgBaselineTbt, summary.avgOptimizedTbt), 'ms')} |`
  );
  lines.push(
    `| Transfer | ${fmtInt(summary.avgBaselineTransferKB, 'KB')} | ${fmtInt(summary.avgOptimizedTransferKB, 'KB')} | ${fmtSigned(delta(summary.avgBaselineTransferKB, summary.avgOptimizedTransferKB), 'KB')} |`
  );
  lines.push(
    `| Script | ${fmtInt(summary.avgBaselineScriptKB, 'KB')} | ${fmtInt(summary.avgOptimizedScriptKB, 'KB')} | ${fmtSigned(delta(summary.avgBaselineScriptKB, summary.avgOptimizedScriptKB), 'KB')} |`
  );
  lines.push(
    `| Requests | ${fmtInt(summary.avgBaselineRequests)} | ${fmtInt(summary.avgOptimizedRequests)} | ${fmtSigned(delta(summary.avgBaselineRequests, summary.avgOptimizedRequests))} |`
  );
  lines.push('');
  lines.push('## Best Improvements');
  lines.push('');
  lines.push(
    `- Score gain: ${summary.bestScoreGain ? `\`${summary.bestScoreGain.route}\` (${fmtSigned(summary.bestScoreGain.value)})` : '-'}`
  );
  lines.push(
    `- FCP drop: ${summary.bestFcpDrop ? `\`${summary.bestFcpDrop.route}\` (${fmtSigned(summary.bestFcpDrop.value, 'ms')})` : '-'}`
  );
  lines.push(
    `- LCP drop: ${summary.bestLcpDrop ? `\`${summary.bestLcpDrop.route}\` (${fmtSigned(summary.bestLcpDrop.value, 'ms')})` : '-'}`
  );
  lines.push(
    `- SI drop: ${summary.bestSpeedIndexDrop ? `\`${summary.bestSpeedIndexDrop.route}\` (${fmtSigned(summary.bestSpeedIndexDrop.value, 'ms')})` : '-'}`
  );
  lines.push(
    `- TBT drop: ${summary.bestTbtDrop ? `\`${summary.bestTbtDrop.route}\` (${fmtSigned(summary.bestTbtDrop.value, 'ms')})` : '-'}`
  );
  lines.push(
    `- Transfer drop: ${summary.bestTransferDrop ? `\`${summary.bestTransferDrop.route}\` (${fmtSigned(summary.bestTransferDrop.value, 'KB')})` : '-'}`
  );
  lines.push(
    `- Script drop: ${summary.bestScriptDrop ? `\`${summary.bestScriptDrop.route}\` (${fmtSigned(summary.bestScriptDrop.value, 'KB')})` : '-'}`
  );
  lines.push('');
  lines.push('## Route Comparison');
  lines.push('');
  lines.push(
    '| Route | Score (B/O/d) | FCP ms (B/O/d) | LCP ms (B/O/d) | SI ms (B/O/d) | TBT ms (B/O/d) | CLS (B/O/d) | KB (B/O/d) | Script KB (B/O/d) | Reqs (B/O/d) |'
  );
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');

  for (const row of rows) {
    lines.push(
      `| \`${row.route}\` | ${scoreEmoji(row.optimized.score)} ${fmtInt(row.baseline.score)}/${fmtInt(row.optimized.score)}/${fmtSigned(row.delta.score)} | ${fmtInt(row.baseline.fcp)}/${fmtInt(row.optimized.fcp)}/${fmtSigned(row.delta.fcp)} | ${fmtInt(row.baseline.lcp)}/${fmtInt(row.optimized.lcp)}/${fmtSigned(row.delta.lcp)} | ${fmtInt(row.baseline.speedIndex)}/${fmtInt(row.optimized.speedIndex)}/${fmtSigned(row.delta.speedIndex)} | ${fmtInt(row.baseline.tbt)}/${fmtInt(row.optimized.tbt)}/${fmtSigned(row.delta.tbt)} | ${fmtFloat(row.baseline.cls, 3)}/${fmtFloat(row.optimized.cls, 3)}/${fmtSignedFloat(row.delta.cls, 3)} | ${fmtInt(row.baseline.transferKB)}/${fmtInt(row.optimized.transferKB)}/${fmtSigned(row.delta.transferKB)} | ${fmtInt(row.baseline.scriptKB)}/${fmtInt(row.optimized.scriptKB)}/${fmtSigned(row.delta.scriptKB)} | ${fmtInt(row.baseline.requestCount)}/${fmtInt(row.optimized.requestCount)}/${fmtSigned(delta(row.baseline.requestCount, row.optimized.requestCount))} |`
    );
  }

  lines.push('');
  lines.push('## Artifacts');
  lines.push('');
  lines.push(`- HTML: \`${context.htmlFileName}\``);
  lines.push(`- JSON data: \`${context.dataFileName}\``);
  lines.push('');

  return lines.join('\n');
}

function calcWidth(value, maxValue) {
  if (value === null || maxValue <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / maxValue) * 100)));
}

function renderMetricRows(rows, field, maxValue, formatter) {
  return rows
    .map((row) => {
      const baselineValue = row.baseline[field];
      const optimizedValue = row.optimized[field];
      const baselineWidth = calcWidth(baselineValue, maxValue);
      const optimizedWidth = calcWidth(optimizedValue, maxValue);
      const deltaValue = row.delta[field];
      const improveClass =
        typeof deltaValue === 'number' && deltaValue < 0
          ? 'good'
          : typeof deltaValue === 'number' && deltaValue > 0
            ? 'bad'
            : '';

      return `
        <div class="metric-row">
          <div class="route mono">${htmlEscape(row.route)}</div>
          <div class="bar-track"><span class="bar bar-base" style="width:${baselineWidth}%"></span></div>
          <div class="value mono">${formatter(baselineValue)}</div>
          <div class="bar-track"><span class="bar bar-opt ${improveClass}" style="width:${optimizedWidth}%"></span></div>
          <div class="value mono">${formatter(optimizedValue)}</div>
          <div class="value mono ${improveClass}">${fmtSigned(deltaValue)}</div>
        </div>
      `;
    })
    .join('\n');
}

function renderTableRows(rows) {
  return rows
    .map(
      (row) => `
      <tr>
        <td class="mono">${htmlEscape(row.route)}</td>
        <td>${fmtInt(row.baseline.score)}</td>
        <td>${fmtInt(row.optimized.score)}</td>
        <td>${fmtSigned(row.delta.score)}</td>
        <td>${fmtInt(row.baseline.fcp)}</td>
        <td>${fmtInt(row.optimized.fcp)}</td>
        <td>${fmtSigned(row.delta.fcp)}</td>
        <td>${fmtInt(row.baseline.lcp)}</td>
        <td>${fmtInt(row.optimized.lcp)}</td>
        <td>${fmtSigned(row.delta.lcp)}</td>
        <td>${fmtInt(row.baseline.speedIndex)}</td>
        <td>${fmtInt(row.optimized.speedIndex)}</td>
        <td>${fmtSigned(row.delta.speedIndex)}</td>
        <td>${fmtInt(row.baseline.tbt)}</td>
        <td>${fmtInt(row.optimized.tbt)}</td>
        <td>${fmtSigned(row.delta.tbt)}</td>
        <td>${fmtFloat(row.baseline.cls, 3)}</td>
        <td>${fmtFloat(row.optimized.cls, 3)}</td>
        <td>${fmtSignedFloat(row.delta.cls, 3)}</td>
        <td>${fmtInt(row.baseline.transferKB)}</td>
        <td>${fmtInt(row.optimized.transferKB)}</td>
        <td>${fmtSigned(row.delta.transferKB)}</td>
        <td>${fmtInt(row.baseline.scriptKB)}</td>
        <td>${fmtInt(row.optimized.scriptKB)}</td>
        <td>${fmtSigned(row.delta.scriptKB)}</td>
        <td>${fmtInt(row.baseline.requestCount)}</td>
        <td>${fmtInt(row.optimized.requestCount)}</td>
        <td>${fmtSigned(delta(row.baseline.requestCount, row.optimized.requestCount))}</td>
      </tr>
    `
    )
    .join('\n');
}

function renderHtml(rows, summary, context) {
  const maxLcp = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.lcp ?? 0, row.optimized.lcp ?? 0])
  );
  const maxTbt = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.tbt ?? 0, row.optimized.tbt ?? 0])
  );
  const maxTransfer = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.transferKB ?? 0, row.optimized.transferKB ?? 0])
  );
  const maxFcp = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.fcp ?? 0, row.optimized.fcp ?? 0])
  );
  const maxSpeedIndex = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.speedIndex ?? 0, row.optimized.speedIndex ?? 0])
  );
  const maxCls = Math.max(
    0.001,
    ...rows.flatMap((row) => [row.baseline.cls ?? 0, row.optimized.cls ?? 0])
  );
  const maxScript = Math.max(
    1,
    ...rows.flatMap((row) => [row.baseline.scriptKB ?? 0, row.optimized.scriptKB ?? 0])
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Performance Visual Summary - ${htmlEscape(context.dateStamp)}</title>
  <style>
    :root {
      --bg: #f4f1ea;
      --panel: #fffdfa;
      --ink: #1b1e22;
      --muted: #5d6670;
      --line: #dad0c2;
      --base: #5b6f84;
      --opt: #1d8f6b;
      --warn: #c1492f;
      --ok: #1d8f6b;
      --card-shadow: 0 12px 40px rgba(19, 24, 31, 0.09);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "IBM Plex Sans", "Noto Sans", "Segoe UI", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(1600px 400px at 10% -10%, rgba(28, 143, 107, 0.08), transparent 60%),
        radial-gradient(1200px 300px at 90% -20%, rgba(193, 73, 47, 0.08), transparent 60%),
        var(--bg);
    }
    .mono { font-family: "IBM Plex Mono", "Consolas", monospace; }
    .shell {
      max-width: 1180px;
      margin: 0 auto;
      padding: 40px 20px 72px;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 42px);
      letter-spacing: 0.3px;
    }
    .subtitle {
      margin-top: 10px;
      color: var(--muted);
      font-size: 14px;
    }
    .meta {
      margin-top: 12px;
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 13px;
    }
    .cards {
      margin-top: 26px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 16px 16px 14px;
      box-shadow: var(--card-shadow);
    }
    .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 10px;
    }
    .metric {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.1;
    }
    .metric small {
      font-size: 14px;
      font-weight: 500;
      color: var(--muted);
      margin-left: 6px;
    }
    .delta {
      margin-top: 6px;
      font-size: 13px;
      color: var(--muted);
    }
    .panel {
      margin-top: 20px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: var(--card-shadow);
      overflow: hidden;
    }
    .panel h2 {
      margin: 0;
      font-size: 18px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(90deg, rgba(29, 143, 107, 0.08), transparent 70%);
    }
    .metric-grid {
      padding: 12px 12px 16px;
    }
    .legend {
      display: grid;
      grid-template-columns: 230px 1fr 90px 1fr 90px 80px;
      gap: 10px;
      font-size: 12px;
      color: var(--muted);
      padding: 0 8px 10px;
      border-bottom: 1px dashed var(--line);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-row {
      display: grid;
      grid-template-columns: 230px 1fr 90px 1fr 90px 80px;
      gap: 10px;
      align-items: center;
      padding: 8px;
      border-radius: 10px;
    }
    .metric-row:nth-child(odd) { background: rgba(18, 24, 33, 0.02); }
    .route {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
    .bar-track {
      height: 10px;
      background: #e8e2d8;
      border-radius: 999px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      display: block;
      border-radius: inherit;
    }
    .bar-base { background: linear-gradient(90deg, #6f84a0, #4d627d); }
    .bar-opt { background: linear-gradient(90deg, #29a078, #1b7c5f); }
    .bar-opt.bad { background: linear-gradient(90deg, #d5674f, #bc3e25); }
    .value {
      text-align: right;
      font-size: 12px;
      color: #28303a;
    }
    .good { color: var(--ok); }
    .bad { color: var(--warn); }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 8px 10px;
      text-align: right;
      white-space: nowrap;
    }
    th:first-child, td:first-child { text-align: left; }
    thead th {
      position: sticky;
      top: 0;
      background: #f2ede4;
      z-index: 1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
    }
    .table-wrap {
      max-height: 420px;
      overflow: auto;
    }
    @media (max-width: 1100px) {
      .legend, .metric-row {
        grid-template-columns: 170px 1fr 70px 1fr 70px 60px;
      }
    }
    @media (max-width: 820px) {
      .legend { display: none; }
      .metric-row {
        grid-template-columns: 1fr;
        gap: 6px;
        padding: 10px;
      }
      .value { text-align: left; }
      .route { font-size: 13px; }
      .bar-track { height: 8px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <h1>Performance Visual Summary</h1>
    <div class="subtitle">Lighthouse baseline vs optimized comparison for key routes.</div>
    <div class="meta mono">
      <span>Baseline: ${htmlEscape(context.baselineDir)}</span>
      <span>Optimized: ${htmlEscape(context.optimizedDir)}</span>
      <span>Generated: ${htmlEscape(context.generatedAtIso)}</span>
    </div>

    <section class="cards">
      <article class="card">
        <div class="label">Avg Score</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedScore)}<small>vs ${fmtInt(summary.avgBaselineScore)}</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineScore, summary.avgOptimizedScore))}</div>
      </article>
      <article class="card">
        <div class="label">Avg LCP</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedLcp)}<small>ms</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineLcp, summary.avgOptimizedLcp), 'ms')}</div>
      </article>
      <article class="card">
        <div class="label">Avg TBT</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedTbt)}<small>ms</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineTbt, summary.avgOptimizedTbt), 'ms')}</div>
      </article>
      <article class="card">
        <div class="label">Avg Transfer</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedTransferKB)}<small>KB</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineTransferKB, summary.avgOptimizedTransferKB), 'KB')}</div>
      </article>
    </section>

    <section class="cards">
      <article class="card">
        <div class="label">Avg FCP</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedFcp)}<small>ms</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineFcp, summary.avgOptimizedFcp), 'ms')}</div>
      </article>
      <article class="card">
        <div class="label">Avg Speed Index</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedSpeedIndex)}<small>ms</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineSpeedIndex, summary.avgOptimizedSpeedIndex), 'ms')}</div>
      </article>
      <article class="card">
        <div class="label">Avg Script Size</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedScriptKB)}<small>KB</small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineScriptKB, summary.avgOptimizedScriptKB), 'KB')}</div>
      </article>
      <article class="card">
        <div class="label">Avg Requests</div>
        <div class="metric mono">${fmtInt(summary.avgOptimizedRequests)}<small></small></div>
        <div class="delta mono">Delta ${fmtSigned(delta(summary.avgBaselineRequests, summary.avgOptimizedRequests))}</div>
      </article>
    </section>

    <section class="panel">
      <h2>Score (higher is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'score', 100, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>LCP (ms, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'lcp', maxLcp, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>TBT (ms, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'tbt', maxTbt, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>Transfer Size (KB, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'transferKB', maxTransfer, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>FCP (ms, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'fcp', maxFcp, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>Speed Index (ms, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'speedIndex', maxSpeedIndex, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>CLS (lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'cls', maxCls, (v) => fmtFloat(v, 3))}
      </div>
    </section>

    <section class="panel">
      <h2>Script Size (KB, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Route</div>
          <div>Baseline</div>
          <div>Value</div>
          <div>Optimized</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderMetricRows(rows, 'scriptKB', maxScript, (v) => fmtInt(v))}
      </div>
    </section>

    <section class="panel">
      <h2>Detailed Table</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Score B</th><th>Score O</th><th>d</th>
              <th>FCP B</th><th>FCP O</th><th>d</th>
              <th>LCP B</th><th>LCP O</th><th>d</th>
              <th>SI B</th><th>SI O</th><th>d</th>
              <th>TBT B</th><th>TBT O</th><th>d</th>
              <th>CLS B</th><th>CLS O</th><th>d</th>
              <th>KB B</th><th>KB O</th><th>d</th>
              <th>Scr B</th><th>Scr O</th><th>d</th>
              <th>Req B</th><th>Req O</th><th>d</th>
            </tr>
          </thead>
          <tbody>
            ${renderTableRows(rows)}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const baselineRootDir = path.resolve(args.baseline ?? 'docs/performance/baseline');
  const optimizedRootDir = path.resolve(args.optimized ?? 'docs/performance/optimized');
  const baselineDir = resolveReportSourceDir(baselineRootDir, 'baseline');
  const optimizedDir = resolveReportSourceDir(optimizedRootDir, 'optimized');
  const dateStamp = toLocalDateStamp();
  const outDir = path.resolve(args.outDir ?? path.join('docs/performance/reports', dateStamp));
  const markdownFileName = args.markdown ?? 'summary.md';
  const htmlFileName = args.html ?? 'summary.html';
  const dataFileName = args.data ?? 'summary-data.json';

  ensureDir(outDir);

  const baselineFiles = listJsonFileNames(baselineDir);
  const optimizedFiles = listJsonFileNames(optimizedDir);
  const commonFileNames = [...baselineFiles].filter((name) => optimizedFiles.has(name)).sort();

  // Warn about routes only in one directory
  const onlyInBaseline = [...baselineFiles].filter((name) => !optimizedFiles.has(name));
  const onlyInOptimized = [...optimizedFiles].filter((name) => !baselineFiles.has(name));
  if (onlyInBaseline.length > 0) {
    console.warn(
      `WARNING: ${onlyInBaseline.length} route(s) only in baseline (missing from optimized): ${onlyInBaseline.join(', ')}`
    );
  }
  if (onlyInOptimized.length > 0) {
    console.warn(
      `WARNING: ${onlyInOptimized.length} route(s) only in optimized (missing from baseline): ${onlyInOptimized.join(', ')}`
    );
  }

  if (commonFileNames.length === 0) {
    throw new Error('No common JSON reports found between baseline and optimized directories.');
  }

  if (commonFileNames.length < baselineFiles.size || commonFileNames.length < optimizedFiles.size) {
    console.warn(
      `WARNING: Report covers ${commonFileNames.length} routes (baseline has ${baselineFiles.size}, optimized has ${optimizedFiles.size}). Some routes were skipped.`
    );
  }

  const rows = buildRows(commonFileNames, baselineDir, optimizedDir);
  const summary = buildSummary(rows);
  const generatedAtIso = new Date().toISOString();

  const context = {
    dateStamp,
    baselineDir: path.relative(process.cwd(), baselineDir).replaceAll('\\', '/'),
    optimizedDir: path.relative(process.cwd(), optimizedDir).replaceAll('\\', '/'),
    generatedAtIso,
    markdownFileName,
    htmlFileName,
    dataFileName,
  };

  const markdown = renderMarkdown(rows, summary, context);
  const html = renderHtml(rows, summary, context);

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
        baselineDir: context.baselineDir,
        optimizedDir: context.optimizedDir,
        rows,
        summary,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `Performance summary generated: ${path.relative(process.cwd(), markdownPath).replaceAll('\\', '/')}`
  );
  console.log(
    `Visualization generated: ${path.relative(process.cwd(), htmlPath).replaceAll('\\', '/')}`
  );
  console.log(`Data generated: ${path.relative(process.cwd(), dataPath).replaceAll('\\', '/')}`);
}

main();
