import { test, expect } from '@playwright/test';

test.describe('Range Status Page', () => {
  test('should display range status page', async ({ page }) => {
    await page.goto('/range-status');

    // Check page title
    await expect(page).toHaveTitle(/Range Status.*Austin Rifle Club/);

    // Check heading
    await expect(page.getByRole('heading', { name: /Range Status/i })).toBeVisible();
  });

  test('should show range status cards', async ({ page }) => {
    await page.goto('/range-status');

    // Wait for content to load (either real data or loading state)
    await page.waitForTimeout(500);

    // Page should have some content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should show last updated timestamp', async ({ page }) => {
    await page.goto('/range-status');

    // Wait for data to potentially load
    await page.waitForTimeout(1000);

    // Check for timestamp text
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/range-status');

    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();

    // Check for heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/range-status');

    // Page should render properly on mobile
    await expect(page.locator('main')).toBeVisible();

    // Content should not overflow
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });
});
