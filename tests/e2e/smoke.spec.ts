import { expect, test } from '@playwright/test';

test('@smoke home page renders', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('main')).toBeVisible();
});

test('@smoke problems page exposes problem links', async ({ page }) => {
  const response = await page.goto('/problems', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  const links = page.locator('a[href^="/problems/"]');
  await expect(links.first()).toBeVisible();
  expect(await links.count()).toBeGreaterThan(5);
});

test('@smoke two-sum detail page loads visualizer shell', async ({ page }) => {
  const response = await page.goto('/problems/array/two-sum', { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/problems\/array\/two-sum/);
  await expect(page.locator('body')).toContainText('Target:', { timeout: 20_000 });

  const progressLabel = page.getByText(/^\d+\/\d+$/).first();
  await expect(progressLabel).toHaveText(/1\/\d+/);

  await page.keyboard.press('ArrowRight');
  await expect(progressLabel).toHaveText(/2\/\d+/);
});
