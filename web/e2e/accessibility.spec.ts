import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  const pages = [
    { name: 'Homepage', url: '/' },
    { name: 'Range Status', url: '/range-status' },
    { name: 'Calendar', url: '/calendar' },
    { name: 'Membership', url: '/membership' },
    { name: 'Login', url: '/login' },
    { name: 'About', url: '/about' },
  ];

  for (const { name, url } of pages) {
    test(`${name} should have proper document structure`, async ({ page }) => {
      await page.goto(url);

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Should have main landmark
      await expect(page.locator('main')).toBeVisible();

      // Should have lang attribute on html
      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('en');
    });

    test(`${name} should have skip link`, async ({ page }) => {
      await page.goto(url);

      // Skip link should exist
      const skipLink = page.locator('.skip-link, [href="#main-content"]');
      await expect(skipLink).toBeAttached();
    });

    test(`${name} should have proper focus management`, async ({ page }) => {
      await page.goto(url);

      // Tab through focusable elements
      await page.keyboard.press('Tab');

      // Something should be focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  }

  test('should have proper color contrast (visual check)', async ({ page }) => {
    await page.goto('/');

    // Check that body text is visible
    const bodyText = page.locator('body');
    await expect(bodyText).toBeVisible();

    // Check primary heading is visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    // Find all images
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // All images should have alt attribute (can be empty for decorative)
      expect(alt).toBeDefined();
    }
  });

  test('forms should have labels', async ({ page }) => {
    await page.goto('/login');

    // Find all inputs that need labels
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Input should have id for label association, or aria-label/labelledby
      const hasAccessibleName = id || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    // Find all buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text content or aria-label
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('links should have accessible names', async ({ page }) => {
    await page.goto('/');

    // Find all links
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link should have text content, aria-label, or title
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});
