#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sum(values) {
  return values.reduce((acc, v) => acc + v, 0);
}

function toMs(value) {
  return Math.round(value * 1000) / 1000;
}

async function launchBrowser(headless) {
  const attempts = [
    { label: 'msedge', options: { channel: 'msedge', headless } },
    { label: 'chrome', options: { channel: 'chrome', headless } },
    { label: 'chromium-default', options: { headless } },
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const browser = await chromium.launch({
        ...attempt.options,
        args: ['--disable-dev-shm-usage', '--no-sandbox'],
      });
      return { browser, launchedBy: attempt.label };
    } catch (error) {
      lastError = error;
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Unable to launch browser via Playwright. Tried channels: msedge/chrome/default. ${reason}`
  );
}

function loadScenario(scenarioName) {
  const scenariosPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')),
    'perf-scenarios.json'
  );
  if (!fs.existsSync(scenariosPath)) return null;

  const data = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
  if (!Array.isArray(data.scenarios)) return null;

  if (scenarioName) {
    return data.scenarios.find((s) => s.name === scenarioName) ?? null;
  }
  return null;
}

const DEFAULT_INTERACTIONS = [
  { action: 'search', query: 'two sum' },
  { action: 'play-pause' },
  { action: 'step-forward', count: 3 },
  { action: 'reset' },
  { action: 'scroll', deltaY: 720 },
  { action: 'scroll', deltaY: -420 },
];

async function runInteractionFlow(page, interactions) {
  const steps = interactions ?? DEFAULT_INTERACTIONS;
  const keyboardShortcut = process.platform === 'darwin' ? 'Meta+K' : 'Control+K';

  for (const step of steps) {
    switch (step.action) {
      case 'search': {
        await page.waitForTimeout(900);
        await page.keyboard.press(keyboardShortcut).catch(() => {});
        await page.waitForTimeout(250);

        const searchInput = page.locator('input[type="text"]').first();
        const visible = await searchInput
          .isVisible({ timeout: 2500 })
          .then(() => true)
          .catch(() => false);

        if (visible) {
          await searchInput.fill(step.query ?? 'two sum').catch(() => {});
          await page.waitForTimeout(280);
          await page.keyboard.press('ArrowDown').catch(() => {});
          await page.waitForTimeout(180);
          await page.keyboard.press('Escape').catch(() => {});
        }
        break;
      }
      case 'play-pause': {
        await page
          .locator('body')
          .click({ position: { x: 30, y: 30 } })
          .catch(() => {});
        await page.waitForTimeout(250);
        await page.keyboard.press('Space').catch(() => {});
        await page.waitForTimeout(1400);
        await page.keyboard.press('Space').catch(() => {});
        break;
      }
      case 'step-forward': {
        const count = step.count ?? 3;
        for (let i = 0; i < count; i += 1) {
          await page.keyboard.press('ArrowRight').catch(() => {});
          await page.waitForTimeout(150);
        }
        break;
      }
      case 'reset': {
        await page.keyboard.press('Home').catch(() => {});
        await page.waitForTimeout(250);
        break;
      }
      case 'scroll': {
        await page.mouse.wheel(0, step.deltaY ?? 0).catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
      default:
        console.warn(`Unknown interaction action: ${step.action}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = args.baseUrl ?? 'http://localhost:3000';
  const headed = args.headed === 'true';
  const scenarioName = args.scenario ?? null;

  // Load scenario from config if specified
  const scenario = scenarioName ? loadScenario(scenarioName) : null;
  if (scenarioName && !scenario) {
    console.warn(
      `WARNING: Scenario "${scenarioName}" not found in perf-scenarios.json, using defaults.`
    );
  }

  const route = scenario?.route ?? args.route ?? '/problems/array/two-sum';
  const outDir = path.resolve(args.outDir ?? 'docs/performance/drilldown/auto');
  const targetUrl = new URL(route, baseUrl).toString();
  const interactions = scenario?.interactions ?? null;

  console.log(`Scenario: ${scenario ? `${scenario.name} (${scenario.description})` : 'default'}`);

  ensureDir(outDir);

  const tracePath = path.join(outDir, 'performance-trace.zip');
  const harPath = path.join(outDir, 'network.har');
  const beforePath = path.join(outDir, 'screen-before.png');
  const afterPath = path.join(outDir, 'screen-after.png');
  const metricsPath = path.join(outDir, 'auto-metrics.json');
  const summaryPath = path.join(outDir, 'auto-summary.md');

  const consoleLogs = [];
  const failedRequests = [];

  const { browser, launchedBy } = await launchBrowser(!headed);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordHar: {
      path: harPath,
      mode: 'full',
      content: 'embed',
    },
  });

  const page = await context.newPage();
  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString(),
    });
  });
  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: req.url(),
      method: req.method(),
      errorText: req.failure()?.errorText ?? 'unknown',
      time: new Date().toISOString(),
    });
  });

  await page.addInitScript(() => {
    const perfStore = {
      longTasks: [],
      layoutShifts: [],
      marks: [],
    };
    window.__perfDrilldownStore = perfStore;

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          perfStore.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
          });
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          perfStore.layoutShifts.push({
            startTime: entry.startTime,
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });

  const startedAt = new Date().toISOString();

  try {
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 120000 });
    await page.screenshot({ path: beforePath, fullPage: true });

    await runInteractionFlow(page, interactions);
    await page.screenshot({ path: afterPath, fullPage: true });

    const pageMetrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const store = window.__perfDrilldownStore ?? { longTasks: [], layoutShifts: [] };

      const resources = performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        duration: entry.duration,
        transferSize: entry.transferSize ?? 0,
      }));

      return {
        navigation: nav
          ? {
              domContentLoaded: nav.domContentLoadedEventEnd,
              loadEvent: nav.loadEventEnd,
              duration: nav.duration,
              responseStart: nav.responseStart,
              transferSize: nav.transferSize ?? 0,
            }
          : null,
        longTasks: store.longTasks,
        layoutShifts: store.layoutShifts,
        resources,
      };
    });

    const longTaskDurations = pageMetrics.longTasks.map((item) => Number(item.duration || 0));
    const layoutShiftValues = pageMetrics.layoutShifts
      .filter((item) => !item.hadRecentInput)
      .map((item) => Number(item.value || 0));
    const topSlowResources = [...pageMetrics.resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        duration: toMs(item.duration),
      }));

    const topLargeResources = [...pageMetrics.resources]
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 10);

    const computed = {
      startedAt,
      endedAt: new Date().toISOString(),
      targetUrl,
      launchedBy,
      navigation: pageMetrics.navigation
        ? {
            domContentLoadedMs: toMs(pageMetrics.navigation.domContentLoaded),
            loadEventMs: toMs(pageMetrics.navigation.loadEvent),
            totalDurationMs: toMs(pageMetrics.navigation.duration),
            responseStartMs: toMs(pageMetrics.navigation.responseStart),
            transferSize: pageMetrics.navigation.transferSize,
          }
        : null,
      longTask: {
        count: longTaskDurations.length,
        totalDurationMs: toMs(sum(longTaskDurations)),
        maxDurationMs: longTaskDurations.length > 0 ? toMs(Math.max(...longTaskDurations)) : 0,
      },
      layoutShift: {
        count: layoutShiftValues.length,
        totalCls: toMs(sum(layoutShiftValues)),
      },
      resources: {
        totalCount: pageMetrics.resources.length,
        topSlowResources,
        topLargeResources,
      },
      failedRequests,
      consoleErrors: consoleLogs.filter((item) => item.type === 'error'),
      artifacts: {
        tracePath,
        harPath,
        beforePath,
        afterPath,
      },
    };

    fs.writeFileSync(metricsPath, JSON.stringify(computed, null, 2), 'utf8');

    const summary = [
      '# Auto Drilldown Summary',
      '',
      `- URL: \`${targetUrl}\``,
      `- Browser launch: \`${launchedBy}\``,
      `- Long Tasks: \`${computed.longTask.count}\` (max \`${computed.longTask.maxDurationMs}ms\`)`,
      `- CLS (no recent input): \`${computed.layoutShift.totalCls}\``,
      `- Resource count: \`${computed.resources.totalCount}\``,
      `- Failed requests: \`${computed.failedRequests.length}\``,
      `- Console errors: \`${computed.consoleErrors.length}\``,
      '',
      '## Artifacts',
      '',
      `- \`performance-trace.zip\``,
      `- \`network.har\``,
      `- \`screen-before.png\``,
      `- \`screen-after.png\``,
      `- \`auto-metrics.json\``,
      '',
    ].join('\n');
    fs.writeFileSync(summaryPath, summary, 'utf8');
  } finally {
    await context.tracing.stop({ path: tracePath }).catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  console.log(`Auto drilldown completed: ${outDir.replaceAll('\\', '/')}`);
  console.log(
    'Artifacts: performance-trace.zip, network.har, screen-before.png, screen-after.png, auto-metrics.json, auto-summary.md'
  );
}

main().catch((error) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`Auto drilldown failed: ${msg}`);
  process.exit(1);
});
