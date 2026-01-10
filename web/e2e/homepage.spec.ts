import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the homepage with hero section', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Austin Rifle Club/);

    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check navigation is present
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check footer is present
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check main nav links exist
    await expect(page.getByRole('link', { name: /Range Status/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Calendar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Membership/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /About/i })).toBeVisible();
  });

  test('should navigate to range status page', async ({ page }) => {
    await page.goto('/');

    // Click on Range Status link
    await page.getByRole('link', { name: /Range Status/i }).first().click();

    // Should navigate to range status page
    await expect(page).toHaveURL(/range-status/);
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/');

    // Skip link should exist
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();

    // Focus on skip link and check it becomes visible
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu button should be visible
    const menuButton = page.locator('#mobile-menu-button');
    await expect(menuButton).toBeVisible();

    // Click menu button to open mobile nav
    await menuButton.click();

    // Mobile menu should become visible
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).not.toHaveClass(/hidden/);
  });
});
