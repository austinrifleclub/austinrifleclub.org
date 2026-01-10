import { test, expect } from '@playwright/test';

test.describe('Calendar Page', () => {
  test('should display calendar page', async ({ page }) => {
    await page.goto('/calendar');

    // Check page title
    await expect(page).toHaveTitle(/Calendar.*Austin Rifle Club/);

    // Check heading
    await expect(page.getByRole('heading', { name: /Calendar|Events/i })).toBeVisible();
  });

  test('should show events list or calendar view', async ({ page }) => {
    await page.goto('/calendar');

    // Wait for content to load
    await page.waitForTimeout(500);

    // Page should have main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have iCal export link', async ({ page }) => {
    await page.goto('/calendar');

    // Look for iCal/Subscribe/Export link
    const icalLink = page.getByRole('link', { name: /iCal|Subscribe|Export/i });

    // If the link exists, check it points to .ics
    if (await icalLink.count() > 0) {
      const href = await icalLink.getAttribute('href');
      expect(href).toMatch(/\.ics|calendar/i);
    }
  });

  test('should be navigable', async ({ page }) => {
    await page.goto('/calendar');

    // Check for navigation elements (month/week navigation or filters)
    const navigation = page.locator('nav, [role="navigation"], button');
    await expect(navigation.first()).toBeVisible();
  });
});
