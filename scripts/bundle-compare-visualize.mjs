import fs from 'node:fs';
import path from 'node:path';

const BUNDLE_ROOT = path.join('docs/performance/bundle-analysis');
const BEFORE_ROOT = path.join(BUNDLE_ROOT, 'before');
const AFTER_ROOT = path.join(BUNDLE_ROOT, 'after');
const REPORTS_ROOT = path.join(BUNDLE_ROOT, 'reports');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    if (token.includes('=')) {
      const [k, v] = token.split('=');
      args[k.slice(2)] = v ?? '';
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[token.slice(2)] = next;
      i += 1;
      continue;
    }

    args[token.slice(2)] = 'true';
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

function toRelativePosixPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll('\\', '/');
}

function resolveUniqueRunDir(rootDir, stamp) {
  let candidate = path.join(rootDir, stamp);
  if (!fs.existsSync(candidate)) {
    return candidate;
  }

  let index = 1;
  while (true) {
    const suffix = String(index).padStart(2, '0');
    candidate = path.join(rootDir, `${stamp}-${suffix}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    index += 1;
  }
}

function resolveClientHtmlPath(rootDir, label) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`${label} dir does not exist: ${toRelativePosixPath(rootDir)}`);
  }

  const legacyClientPath = path.join(rootDir, 'client.html');
  if (fs.existsSync(legacyClientPath)) {
    return legacyClientPath;
  }

  const runDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const dirName of runDirs) {
    const candidate = path.join(rootDir, dirName, 'client.html');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No client.html found in ${label} dir: ${toRelativePosixPath(rootDir)}. Expected root client.html or timestamp run subdirectories.`
  );
}

function cleanLegacyRootArtifacts() {
  const legacyFiles = [
    'compare-summary.json',
    'compare-report.md',
    'compare.html',
    'bundle-compare.svg',
  ];
  for (const file of legacyFiles) {
    const filePath = path.join(BUNDLE_ROOT, file);
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }
  }
}

function readChartDataFromAnalyzeHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const marker = 'window.chartData = ';
  const start = html.indexOf(marker);

  if (start === -1) {
    throw new Error(`Cannot find chartData in ${filePath}`);
  }

  const from = start + marker.length;
  let end = html.indexOf(';\n      window.entrypoints', from);
  if (end === -1) {
    end = html.indexOf(';\r\n      window.entrypoints', from);
  }
  if (end === -1) {
    throw new Error(`Cannot find chartData end marker in ${filePath}`);
  }

  return JSON.parse(html.slice(from, end));
}

function flattenLeaves(node, isInitial, out) {
  const groups = Array.isArray(node.groups) ? node.groups : [];
  if (!groups.length) {
    out.push({
      path: node.path || node.label || '',
      parsedSize: node.parsedSize || 0,
      gzipSize: node.gzipSize || 0,
      isInitial,
    });
    return;
  }

  for (const child of groups) {
    flattenLeaves(child, isInitial, out);
  }
}

function summarizeClientReport(chartData) {
  const chunks = chartData.map((chunk) => {
    const entrypoints = Object.keys(chunk.isInitialByEntrypoint || {});
    return {
      label: chunk.label || '',
      parsedKB: (chunk.parsedSize || 0) / 1024,
      gzipKB: (chunk.gzipSize || 0) / 1024,
      isInitial: entrypoints.length > 0,
      entrypoints,
    };
  });

  const leaves = [];
  for (const chunk of chartData) {
    const isInitial = Object.keys(chunk.isInitialByEntrypoint || {}).length > 0;
    flattenLeaves(chunk, isInitial, leaves);
  }

  const initialChunks = chunks
    .filter((chunk) => chunk.isInitial)
    .sort((a, b) => b.parsedKB - a.parsedKB);

  const totals = chunks.reduce(
    (acc, chunk) => {
      acc.totalParsedKB += chunk.parsedKB;
      acc.totalGzipKB += chunk.gzipKB;
      if (chunk.isInitial) {
        acc.initialParsedKB += chunk.parsedKB;
        acc.initialGzipKB += chunk.gzipKB;
        acc.initialChunkCount += 1;
      }
      return acc;
    },
    {
      totalParsedKB: 0,
      totalGzipKB: 0,
      initialParsedKB: 0,
      initialGzipKB: 0,
      initialChunkCount: 0,
    }
  );

  const entrypointMap = new Map();
  for (const chunk of chunks) {
    for (const entrypoint of chunk.entrypoints) {
      if (!entrypointMap.has(entrypoint)) {
        entrypointMap.set(entrypoint, { parsedKB: 0, gzipKB: 0, chunkCount: 0 });
      }
      const item = entrypointMap.get(entrypoint);
      item.parsedKB += chunk.parsedKB;
      item.gzipKB += chunk.gzipKB;
      item.chunkCount += 1;
    }
  }

  const entrypoints = [...entrypointMap.entries()]
    .map(([entrypoint, metrics]) => ({
      entrypoint,
      parsedKB: metrics.parsedKB,
      gzipKB: metrics.gzipKB,
      chunkCount: metrics.chunkCount,
    }))
    .sort((a, b) => b.parsedKB - a.parsedKB);

  const katexInitialKB = leaves
    .filter((leaf) => leaf.isInitial && leaf.path.includes('/katex/dist/katex.mjs'))
    .reduce((sum, leaf) => sum + leaf.parsedSize / 1024, 0);

  return {
    totals,
    katexInitialKB,
    topInitialChunks: initialChunks.slice(0, 12),
    entrypoints,
  };
}

function htmlEscape(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatKB(value) {
  return `${value.toFixed(1)}KB`;
}

function formatSignedKB(value) {
  if (value === 0) return '0KB';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}KB`;
}

function toMarkdown(summary, context) {
  const { before, after, delta, generatedAtIso } = summary;

  return `# Bundle Compare Report

- Generated at: \`${generatedAtIso}\`
- Before snapshot: \`${context.beforeClientPath}\`
- After snapshot: \`${context.afterClientPath}\`
- Visualization: \`${context.htmlFileName}\`
- Secondary chart: \`${context.svgFileName}\`

## Core Metrics

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Initial Parsed Total | ${before.totals.initialParsedKB.toFixed(1)}KB | ${after.totals.initialParsedKB.toFixed(1)}KB | ${formatSignedKB(delta.initialParsedKB)} |
| Initial Gzip Total | ${before.totals.initialGzipKB.toFixed(1)}KB | ${after.totals.initialGzipKB.toFixed(1)}KB | ${formatSignedKB(delta.initialGzipKB)} |
| All Parsed Total | ${before.totals.totalParsedKB.toFixed(1)}KB | ${after.totals.totalParsedKB.toFixed(1)}KB | ${formatSignedKB(delta.totalParsedKB)} |
| All Gzip Total | ${before.totals.totalGzipKB.toFixed(1)}KB | ${after.totals.totalGzipKB.toFixed(1)}KB | ${formatSignedKB(delta.totalGzipKB)} |
| Katex in Initial | ${before.katexInitialKB.toFixed(1)}KB | ${after.katexInitialKB.toFixed(1)}KB | ${formatSignedKB(delta.katexInitialKB)} |

## Top Entrypoint Parsed (After)

${after.entrypoints
  .slice(0, 10)
  .map((item, index) => `${index + 1}. \`${item.entrypoint}\` - ${item.parsedKB.toFixed(1)}KB`)
  .join('\n')}
`;
}

function calcWidth(value, maxValue) {
  if (!Number.isFinite(value) || maxValue <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / maxValue) * 100)));
}

function buildEntrypointRows(beforeSummary, afterSummary) {
  const beforeMap = new Map(beforeSummary.entrypoints.map((item) => [item.entrypoint, item]));
  const afterMap = new Map(afterSummary.entrypoints.map((item) => [item.entrypoint, item]));
  const keys = [...new Set([...beforeMap.keys(), ...afterMap.keys()])];

  const rows = keys.map((entrypoint) => {
    const before = beforeMap.get(entrypoint) ?? { parsedKB: 0, gzipKB: 0, chunkCount: 0 };
    const after = afterMap.get(entrypoint) ?? { parsedKB: 0, gzipKB: 0, chunkCount: 0 };
    return {
      entrypoint,
      beforeParsedKB: before.parsedKB,
      afterParsedKB: after.parsedKB,
      deltaParsedKB: after.parsedKB - before.parsedKB,
      beforeGzipKB: before.gzipKB,
      afterGzipKB: after.gzipKB,
      deltaGzipKB: after.gzipKB - before.gzipKB,
      beforeChunkCount: before.chunkCount,
      afterChunkCount: after.chunkCount,
    };
  });

  rows.sort((a, b) => b.afterParsedKB - a.afterParsedKB);
  return rows;
}

function renderEntrypointMetricRows(rows, fieldSet, maxValue) {
  return rows
    .map((row) => {
      const beforeValue = row[fieldSet.before];
      const afterValue = row[fieldSet.after];
      const deltaValue = row[fieldSet.delta];
      const beforeWidth = calcWidth(beforeValue, maxValue);
      const afterWidth = calcWidth(afterValue, maxValue);
      const deltaClass = deltaValue < 0 ? 'good' : deltaValue > 0 ? 'bad' : '';

      return `
        <div class="metric-row">
          <div class="route mono">${htmlEscape(row.entrypoint)}</div>
          <div class="bar-track"><span class="bar bar-base" style="width:${beforeWidth}%"></span></div>
          <div class="value mono">${beforeValue.toFixed(1)}</div>
          <div class="bar-track"><span class="bar bar-opt ${deltaClass}" style="width:${afterWidth}%"></span></div>
          <div class="value mono">${afterValue.toFixed(1)}</div>
          <div class="value mono ${deltaClass}">${formatSignedKB(deltaValue)}</div>
        </div>`;
    })
    .join('\n');
}

function renderChunkTableRows(beforeChunks, afterChunks) {
  const beforeMap = new Map(beforeChunks.map((chunk) => [chunk.label, chunk]));
  const afterMap = new Map(afterChunks.map((chunk) => [chunk.label, chunk]));
  const labels = [...new Set([...beforeMap.keys(), ...afterMap.keys()])].sort();

  return labels
    .map((label) => {
      const before = beforeMap.get(label) ?? {
        parsedKB: 0,
        gzipKB: 0,
        isInitial: false,
        entrypoints: [],
      };
      const after = afterMap.get(label) ?? {
        parsedKB: 0,
        gzipKB: 0,
        isInitial: false,
        entrypoints: [],
      };
      const deltaParsed = after.parsedKB - before.parsedKB;
      const deltaGzip = after.gzipKB - before.gzipKB;

      return `
        <tr>
          <td class="mono">${htmlEscape(label)}</td>
          <td>${before.parsedKB.toFixed(1)}</td>
          <td>${after.parsedKB.toFixed(1)}</td>
          <td class="${deltaParsed < 0 ? 'good' : deltaParsed > 0 ? 'bad' : ''}">${formatSignedKB(deltaParsed)}</td>
          <td>${before.gzipKB.toFixed(1)}</td>
          <td>${after.gzipKB.toFixed(1)}</td>
          <td class="${deltaGzip < 0 ? 'good' : deltaGzip > 0 ? 'bad' : ''}">${formatSignedKB(deltaGzip)}</td>
          <td class="mono">${htmlEscape((after.entrypoints ?? before.entrypoints).join(', ') || '-')}</td>
        </tr>`;
    })
    .join('\n');
}

function renderHtml(summary, context) {
  const { before, after, delta, generatedAtIso } = summary;
  const entrypointRows = buildEntrypointRows(before, after);
  const topEntrypoints = entrypointRows.slice(0, 20);
  const maxEntrypointParsed = Math.max(
    1,
    ...topEntrypoints.flatMap((row) => [row.beforeParsedKB, row.afterParsedKB])
  );
  const maxEntrypointGzip = Math.max(
    1,
    ...topEntrypoints.flatMap((row) => [row.beforeGzipKB, row.afterGzipKB])
  );

  const deltaInitialParsedClass =
    delta.initialParsedKB < 0 ? 'good' : delta.initialParsedKB > 0 ? 'bad' : '';
  const deltaInitialGzipClass =
    delta.initialGzipKB < 0 ? 'good' : delta.initialGzipKB > 0 ? 'bad' : '';
  const deltaTotalParsedClass =
    delta.totalParsedKB < 0 ? 'good' : delta.totalParsedKB > 0 ? 'bad' : '';
  const deltaTotalGzipClass = delta.totalGzipKB < 0 ? 'good' : delta.totalGzipKB > 0 ? 'bad' : '';
  const deltaKatexClass = delta.katexInitialKB < 0 ? 'good' : delta.katexInitialKB > 0 ? 'bad' : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bundle Comparison Report</title>
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
    .shell { max-width: 1240px; margin: 0 auto; padding: 40px 20px 72px; }
    h1 { margin: 0; font-size: clamp(28px, 4vw, 42px); letter-spacing: 0.3px; }
    .subtitle { margin-top: 10px; color: var(--muted); font-size: 14px; }
    .meta {
      margin-top: 12px; display: flex; gap: 14px; flex-wrap: wrap;
      color: var(--muted); font-size: 13px;
    }
    .cards {
      margin-top: 26px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
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
      font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--muted); margin-bottom: 10px;
    }
    .metric { font-size: 28px; font-weight: 700; line-height: 1.1; }
    .metric small { font-size: 14px; font-weight: 500; color: var(--muted); margin-left: 6px; }
    .delta { margin-top: 6px; font-size: 13px; color: var(--muted); }
    .good { color: var(--ok); }
    .bad { color: var(--warn); }
    .panel {
      margin-top: 20px; background: var(--panel); border: 1px solid var(--line);
      border-radius: 18px; box-shadow: var(--card-shadow); overflow: hidden;
    }
    .panel h2 {
      margin: 0; font-size: 18px; padding: 16px 18px; border-bottom: 1px solid var(--line);
      background: linear-gradient(90deg, rgba(29, 143, 107, 0.08), transparent 70%);
    }
    .metric-grid { padding: 12px 12px 16px; }
    .legend {
      display: grid; grid-template-columns: 320px 1fr 100px 1fr 100px 90px; gap: 10px;
      font-size: 12px; color: var(--muted); padding: 0 8px 10px;
      border-bottom: 1px dashed var(--line); margin-bottom: 8px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .metric-row {
      display: grid; grid-template-columns: 320px 1fr 100px 1fr 100px 90px; gap: 10px;
      align-items: center; padding: 8px; border-radius: 10px;
    }
    .metric-row:nth-child(odd) { background: rgba(18, 24, 33, 0.02); }
    .route {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;
    }
    .bar-track {
      height: 10px; background: #e8e2d8; border-radius: 999px; overflow: hidden;
    }
    .bar { height: 100%; display: block; border-radius: inherit; }
    .bar-base { background: linear-gradient(90deg, #6f84a0, #4d627d); }
    .bar-opt { background: linear-gradient(90deg, #29a078, #1b7c5f); }
    .bar-opt.bad { background: linear-gradient(90deg, #d5674f, #bc3e25); }
    .value { text-align: right; font-size: 12px; color: #28303a; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td {
      border-bottom: 1px solid var(--line); padding: 8px 10px; text-align: right; white-space: nowrap;
    }
    th:first-child, td:first-child, th:last-child, td:last-child { text-align: left; }
    thead th {
      position: sticky; top: 0; background: #f2ede4; z-index: 1; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);
    }
    .table-wrap { max-height: 460px; overflow: auto; }
    @media (max-width: 1180px) {
      .legend, .metric-row { grid-template-columns: 220px 1fr 78px 1fr 78px 70px; }
    }
    @media (max-width: 880px) {
      .legend { display: none; }
      .metric-row { grid-template-columns: 1fr; gap: 6px; padding: 10px; }
      .value { text-align: left; }
      .route { font-size: 13px; }
      .bar-track { height: 8px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <h1>Bundle Visual Summary</h1>
    <div class="subtitle">Webpack bundle analyzer before vs after comparison.</div>
    <div class="meta mono">
      <span>Before: ${htmlEscape(context.beforeClientPath)}</span>
      <span>After: ${htmlEscape(context.afterClientPath)}</span>
      <span>Generated: ${htmlEscape(generatedAtIso)}</span>
    </div>

    <section class="cards">
      <article class="card">
        <div class="label">Initial Parsed</div>
        <div class="metric mono">${formatKB(after.totals.initialParsedKB)}<small>vs ${formatKB(before.totals.initialParsedKB)}</small></div>
        <div class="delta mono ${deltaInitialParsedClass}">Delta ${formatSignedKB(delta.initialParsedKB)}</div>
      </article>
      <article class="card">
        <div class="label">Initial Gzip</div>
        <div class="metric mono">${formatKB(after.totals.initialGzipKB)}<small>vs ${formatKB(before.totals.initialGzipKB)}</small></div>
        <div class="delta mono ${deltaInitialGzipClass}">Delta ${formatSignedKB(delta.initialGzipKB)}</div>
      </article>
      <article class="card">
        <div class="label">All Parsed</div>
        <div class="metric mono">${formatKB(after.totals.totalParsedKB)}<small>vs ${formatKB(before.totals.totalParsedKB)}</small></div>
        <div class="delta mono ${deltaTotalParsedClass}">Delta ${formatSignedKB(delta.totalParsedKB)}</div>
      </article>
      <article class="card">
        <div class="label">All Gzip</div>
        <div class="metric mono">${formatKB(after.totals.totalGzipKB)}<small>vs ${formatKB(before.totals.totalGzipKB)}</small></div>
        <div class="delta mono ${deltaTotalGzipClass}">Delta ${formatSignedKB(delta.totalGzipKB)}</div>
      </article>
      <article class="card">
        <div class="label">Katex in Initial</div>
        <div class="metric mono">${formatKB(after.katexInitialKB)}<small>vs ${formatKB(before.katexInitialKB)}</small></div>
        <div class="delta mono ${deltaKatexClass}">Delta ${formatSignedKB(delta.katexInitialKB)}</div>
      </article>
    </section>

    <section class="panel">
      <h2>Entrypoint Parsed (KB, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Entrypoint</div>
          <div>Before</div>
          <div>Value</div>
          <div>After</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderEntrypointMetricRows(
          topEntrypoints,
          {
            before: 'beforeParsedKB',
            after: 'afterParsedKB',
            delta: 'deltaParsedKB',
          },
          maxEntrypointParsed
        )}
      </div>
    </section>

    <section class="panel">
      <h2>Entrypoint Gzip (KB, lower is better)</h2>
      <div class="metric-grid">
        <div class="legend">
          <div>Entrypoint</div>
          <div>Before</div>
          <div>Value</div>
          <div>After</div>
          <div>Value</div>
          <div>Delta</div>
        </div>
        ${renderEntrypointMetricRows(
          topEntrypoints,
          {
            before: 'beforeGzipKB',
            after: 'afterGzipKB',
            delta: 'deltaGzipKB',
          },
          maxEntrypointGzip
        )}
      </div>
    </section>

    <section class="panel">
      <h2>Top Initial Chunks (Detailed)</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Chunk</th>
              <th>Parsed B</th>
              <th>Parsed A</th>
              <th>Parsed Delta</th>
              <th>Gzip B</th>
              <th>Gzip A</th>
              <th>Gzip Delta</th>
              <th>Entrypoints</th>
            </tr>
          </thead>
          <tbody>
            ${renderChunkTableRows(before.topInitialChunks, after.topInitialChunks)}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function buildSvg(summary, context) {
  const width = 1280;
  const height = 580;
  const { before, after, delta } = summary;
  const maxVal = Math.max(
    before.totals.initialParsedKB,
    after.totals.initialParsedKB,
    before.totals.initialGzipKB,
    after.totals.initialGzipKB
  );

  const barWidth = 360;
  const chartLeft = 120;
  const firstRowTop = 180;
  const secondRowTop = 320;
  const beforeParsedW = (before.totals.initialParsedKB / maxVal) * barWidth;
  const afterParsedW = (after.totals.initialParsedKB / maxVal) * barWidth;
  const beforeGzipW = (before.totals.initialGzipKB / maxVal) * barWidth;
  const afterGzipW = (after.totals.initialGzipKB / maxVal) * barWidth;

  const deltaColor = delta.initialParsedKB <= 0 ? '#10b981' : '#ef4444';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bundle compare summary">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#0f172a" />
  <text x="64" y="72" fill="#f8fafc" font-size="34" font-weight="800">Bundle Compare Snapshot</text>
  <text x="64" y="104" fill="#94a3b8" font-size="16">Initial bundle totals (before vs after)</text>

  <text x="${chartLeft}" y="${firstRowTop - 18}" fill="#cbd5e1" font-size="18">Initial Parsed</text>
  <rect x="${chartLeft}" y="${firstRowTop}" width="${beforeParsedW.toFixed(1)}" height="18" rx="8" fill="#ef4444" />
  <text x="${chartLeft + beforeParsedW + 10}" y="${firstRowTop + 14}" fill="#fca5a5" font-size="14">Before ${before.totals.initialParsedKB.toFixed(1)}KB</text>
  <rect x="${chartLeft}" y="${firstRowTop + 26}" width="${afterParsedW.toFixed(1)}" height="18" rx="8" fill="#10b981" />
  <text x="${chartLeft + afterParsedW + 10}" y="${firstRowTop + 40}" fill="#86efac" font-size="14">After ${after.totals.initialParsedKB.toFixed(1)}KB</text>

  <text x="${chartLeft}" y="${secondRowTop - 18}" fill="#cbd5e1" font-size="18">Initial Gzip</text>
  <rect x="${chartLeft}" y="${secondRowTop}" width="${beforeGzipW.toFixed(1)}" height="18" rx="8" fill="#ef4444" />
  <text x="${chartLeft + beforeGzipW + 10}" y="${secondRowTop + 14}" fill="#fca5a5" font-size="14">Before ${before.totals.initialGzipKB.toFixed(1)}KB</text>
  <rect x="${chartLeft}" y="${secondRowTop + 26}" width="${afterGzipW.toFixed(1)}" height="18" rx="8" fill="#10b981" />
  <text x="${chartLeft + afterGzipW + 10}" y="${secondRowTop + 40}" fill="#86efac" font-size="14">After ${after.totals.initialGzipKB.toFixed(1)}KB</text>

  <rect x="760" y="156" width="460" height="220" rx="14" fill="#111827" stroke="#1f2937" />
  <text x="790" y="198" fill="#e2e8f0" font-size="20" font-weight="700">Key Deltas</text>
  <text x="790" y="232" fill="${deltaColor}" font-size="18">Initial Parsed: ${formatSignedKB(delta.initialParsedKB)}</text>
  <text x="790" y="262" fill="${delta.initialGzipKB <= 0 ? '#10b981' : '#ef4444'}" font-size="18">Initial Gzip: ${formatSignedKB(delta.initialGzipKB)}</text>
  <text x="790" y="292" fill="${delta.katexInitialKB <= 0 ? '#10b981' : '#ef4444'}" font-size="18">Katex Initial: ${formatSignedKB(delta.katexInitialKB)}</text>
  <text x="790" y="322" fill="${delta.totalParsedKB <= 0 ? '#10b981' : '#ef4444'}" font-size="18">All Parsed: ${formatSignedKB(delta.totalParsedKB)}</text>
  <text x="790" y="352" fill="${delta.totalGzipKB <= 0 ? '#10b981' : '#ef4444'}" font-size="18">All Gzip: ${formatSignedKB(delta.totalGzipKB)}</text>

  <text x="64" y="528" fill="#94a3b8" font-size="14">See ${htmlEscape(context.htmlFileName)} for full dashboard and table details.</text>
</svg>`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const beforeRootDir = path.resolve(args.before ?? BEFORE_ROOT);
  const afterRootDir = path.resolve(args.after ?? AFTER_ROOT);
  const dateStamp = args.stamp ?? toLocalDateStamp();

  const beforeClientPath = resolveClientHtmlPath(beforeRootDir, 'before');
  const afterClientPath = resolveClientHtmlPath(afterRootDir, 'after');

  const outDir = args.outDir
    ? path.resolve(args.outDir)
    : path.resolve(resolveUniqueRunDir(path.resolve(REPORTS_ROOT), dateStamp));
  const summaryFileName = args.json ?? 'compare-summary.json';
  const reportFileName = args.markdown ?? 'compare-report.md';
  const htmlFileName = args.html ?? 'compare.html';
  const svgFileName = args.svg ?? 'bundle-compare.svg';

  const summaryPath = path.join(outDir, summaryFileName);
  const reportPath = path.join(outDir, reportFileName);
  const htmlPath = path.join(outDir, htmlFileName);
  const svgPath = path.join(outDir, svgFileName);

  const shouldClean = args.clean === 'true';
  if (shouldClean) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  if (args.cleanRoot === 'true') {
    fs.rmSync(path.resolve(REPORTS_ROOT), { recursive: true, force: true });
    cleanLegacyRootArtifacts();
  }
  fs.mkdirSync(outDir, { recursive: true });

  const beforeData = readChartDataFromAnalyzeHtml(beforeClientPath);
  const afterData = readChartDataFromAnalyzeHtml(afterClientPath);

  const beforeSummary = summarizeClientReport(beforeData);
  const afterSummary = summarizeClientReport(afterData);
  const generatedAtIso = new Date().toISOString();

  const summary = {
    generatedAtIso,
    before: beforeSummary,
    after: afterSummary,
    delta: {
      initialParsedKB: afterSummary.totals.initialParsedKB - beforeSummary.totals.initialParsedKB,
      initialGzipKB: afterSummary.totals.initialGzipKB - beforeSummary.totals.initialGzipKB,
      totalParsedKB: afterSummary.totals.totalParsedKB - beforeSummary.totals.totalParsedKB,
      totalGzipKB: afterSummary.totals.totalGzipKB - beforeSummary.totals.totalGzipKB,
      katexInitialKB: afterSummary.katexInitialKB - beforeSummary.katexInitialKB,
    },
  };

  const context = {
    dateStamp,
    beforeClientPath: toRelativePosixPath(beforeClientPath),
    afterClientPath: toRelativePosixPath(afterClientPath),
    htmlFileName,
    svgFileName,
  };

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(reportPath, toMarkdown(summary, context), 'utf8');
  fs.writeFileSync(htmlPath, renderHtml(summary, context), 'utf8');
  fs.writeFileSync(svgPath, buildSvg(summary, context), 'utf8');

  console.log(`Wrote summary JSON: ${toRelativePosixPath(summaryPath)}`);
  console.log(`Wrote compare report: ${toRelativePosixPath(reportPath)}`);
  console.log(`Wrote compare HTML: ${toRelativePosixPath(htmlPath)}`);
  console.log(`Wrote compare SVG: ${toRelativePosixPath(svgPath)}`);
}

main();
