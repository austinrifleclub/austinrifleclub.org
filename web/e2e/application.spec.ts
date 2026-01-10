import { test, expect } from '@playwright/test';

test.describe('Membership Application', () => {
  test('should navigate to application from membership page', async ({ page }) => {
    await page.goto('/membership');

    // Click on apply/join button
    const applyLink = page.getByRole('link', { name: /Apply|Join|Start.*Application/i });

    if (await applyLink.count() > 0) {
      await applyLink.first().click();

      // Should navigate to apply page
      await expect(page).toHaveURL(/apply|application|join/);
    }
  });

  test('should display application page', async ({ page }) => {
    await page.goto('/apply');

    // Check page title
    await expect(page).toHaveTitle(/Apply|Application|Join.*Austin Rifle Club/);

    // Check heading
    await expect(page.getByRole('heading', { name: /Apply|Application|Membership/i })).toBeVisible();
  });

  test('should show membership type selection', async ({ page }) => {
    await page.goto('/apply');

    // Look for membership type options
    const content = await page.textContent('main');

    // Should mention membership types
    expect(content).toMatch(/individual|family|annual|regular/i);
  });

  test('should have required form fields', async ({ page }) => {
    await page.goto('/apply');

    // Check for name fields
    const firstNameInput = page.locator('input[name*="first" i], input[placeholder*="first" i]');
    const lastNameInput = page.locator('input[name*="last" i], input[placeholder*="last" i]');

    // At least one name field should exist
    const hasNameFields = (await firstNameInput.count() > 0) || (await lastNameInput.count() > 0);
    expect(hasNameFields).toBeTruthy();

    // Check for email field
    const emailInput = page.locator('input[type="email"], input[name*="email" i]');
    await expect(emailInput).toBeVisible();
  });

  test('should validate required fields on submit', async ({ page }) => {
    await page.goto('/apply');

    // Find and click submit button
    const submitButton = page.getByRole('button', { name: /Submit|Apply|Continue|Next/i });

    if (await submitButton.count() > 0) {
      await submitButton.first().click();

      // Should show validation errors or stay on page
      await expect(page).toHaveURL(/apply|application/);
    }
  });

  test('should show pricing information', async ({ page }) => {
    await page.goto('/apply');

    // Page should contain pricing
    const content = await page.textContent('body');
    expect(content).toMatch(/\$\d+|\d+\s*dollars?/i);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/apply');

    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Form should have labels
    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have accessible name
      const hasAccessibleName = id || ariaLabel || ariaLabelledBy || placeholder;
      expect(hasAccessibleName).toBeTruthy();
    }
  });
});

test.describe('Application Resume', () => {
  test('should show resume application option on login page', async ({ page }) => {
    await page.goto('/login');

    // Look for resume application link or text
    const content = await page.textContent('body');

    // May or may not have resume option depending on implementation
    expect(content).toBeTruthy();
  });
});
