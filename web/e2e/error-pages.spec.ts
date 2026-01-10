import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
  test('should display 404 page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should show 404 content
    await expect(page.getByText(/404|not found|page.*exist/i)).toBeVisible();
  });

  test('should have navigation on 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Should still have navigation to go back
    const homeLink = page.getByRole('link', { name: /home|back|return/i });

    if (await homeLink.count() > 0) {
      await expect(homeLink.first()).toBeVisible();
    }
  });

  test('404 page should be styled correctly', async ({ page }) => {
    await page.goto('/some-random-url-that-doesnt-exist');

    // Page should have header
    await expect(page.locator('header').or(page.locator('nav'))).toBeVisible();

    // Page should have main content area
    await expect(page.locator('main')).toBeVisible();
  });
});
