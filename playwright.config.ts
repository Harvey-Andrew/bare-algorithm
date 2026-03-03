import { defineConfig, devices } from '@playwright/test';

// Ensure loopback endpoints bypass proxy during Playwright webServer health checks.
const resolvedNoProxy = [process.env.NO_PROXY, '127.0.0.1', 'localhost'].filter(Boolean).join(',');
const defaultBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const parsedBaseUrl = new URL(defaultBaseUrl);
const resolvedWebServerPort =
  parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? '443' : '80');

process.env.NO_PROXY = resolvedNoProxy;
process.env.no_proxy = resolvedNoProxy;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,
  outputDir: 'test-results/playwright/artifacts',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright/results.json' }],
    ['html', { outputFolder: 'test-results/playwright/html-report', open: 'never' }],
  ],
  use: {
    baseURL: defaultBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `pnpm dev --port ${resolvedWebServerPort}`,
        url: defaultBaseUrl,
        env: {
          ...process.env,
          NO_PROXY: resolvedNoProxy,
          no_proxy: resolvedNoProxy,
        },
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
});
