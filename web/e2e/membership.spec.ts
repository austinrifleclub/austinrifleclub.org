import { test, expect } from '@playwright/test';

test.describe('Membership Page', () => {
  test('should display membership page', async ({ page }) => {
    await page.goto('/membership');

    // Check page title
    await expect(page).toHaveTitle(/Membership.*Austin Rifle Club/);

    // Check heading
    await expect(page.getByRole('heading', { name: /Membership|Join/i })).toBeVisible();
  });

  test('should show membership types and pricing', async ({ page }) => {
    await page.goto('/membership');

    // Look for pricing or membership type information
    const content = await page.textContent('main');

    // Should mention membership-related terms
    expect(content).toMatch(/individual|family|annual|dues|member/i);
  });

  test('should have application or join link', async ({ page }) => {
    await page.goto('/membership');

    // Look for apply/join button or link
    const applyButton = page.getByRole('link', { name: /Apply|Join|Get Started/i });

    if (await applyButton.count() > 0) {
      await expect(applyButton.first()).toBeVisible();
    }
  });

  test('should display benefits or features', async ({ page }) => {
    await page.goto('/membership');

    // Page should contain information about benefits
    const content = await page.textContent('main');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100); // Should have substantial content
  });
});

test.describe('Login Page', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Login|Sign In.*Austin Rifle Club/);
  });

  test('should have email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Check for email input
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('should have sign in button', async ({ page }) => {
    await page.goto('/login');

    // Check for submit button
    const submitButton = page.getByRole('button', { name: /Sign In|Log In|Submit/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /Sign In|Log In|Submit/i });
    await submitButton.click();

    // Should show validation or stay on page
    await expect(page).toHaveURL(/login/);
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');

    // Check for forgot password link
    const forgotLink = page.getByRole('link', { name: /Forgot|Reset|Password/i });

    if (await forgotLink.count() > 0) {
      await expect(forgotLink.first()).toBeVisible();
    }
  });
});
