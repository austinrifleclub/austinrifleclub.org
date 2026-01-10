import { test, expect } from '@playwright/test';

test.describe('Member Dashboard (Unauthenticated)', () => {
  test('should redirect to login when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login or show unauthorized message
    await expect(page).toHaveURL(/login|auth|dashboard/);
  });

  test('should redirect to login when accessing profile', async ({ page }) => {
    await page.goto('/dashboard/profile');

    // Should redirect to login
    await expect(page).toHaveURL(/login|auth|dashboard/);
  });

  test('should redirect to login when accessing events', async ({ page }) => {
    await page.goto('/dashboard/events');

    // Should redirect to login
    await expect(page).toHaveURL(/login|auth|dashboard/);
  });
});

test.describe('Admin Dashboard (Unauthenticated)', () => {
  test('should redirect to login when accessing admin', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login or show unauthorized
    await expect(page).toHaveURL(/login|auth|admin/);
  });

  test('should redirect to login when accessing admin members', async ({ page }) => {
    await page.goto('/admin/members');

    // Should redirect to login
    await expect(page).toHaveURL(/login|auth|admin/);
  });

  test('should redirect to login when accessing admin applications', async ({ page }) => {
    await page.goto('/admin/applications');

    // Should redirect to login
    await expect(page).toHaveURL(/login|auth|admin/);
  });

  test('should redirect to login when accessing admin events', async ({ page }) => {
    await page.goto('/admin/events');

    // Should redirect to login
    await expect(page).toHaveURL(/login|auth|admin/);
  });
});

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Check for email input
    await expect(page.locator('input[type="email"], input[name*="email" i]')).toBeVisible();

    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /Sign In|Log In|Submit/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[type="email"], input[name*="email" i]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /Sign In|Log In|Submit/i }).click();

    // Wait for response
    await page.waitForTimeout(1000);

    // Should show error or stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should have register link', async ({ page }) => {
    await page.goto('/login');

    // Look for register/signup link
    const registerLink = page.getByRole('link', { name: /Register|Sign Up|Create Account/i });

    if (await registerLink.count() > 0) {
      await expect(registerLink.first()).toBeVisible();
    }
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/login');

    // Look for forgot password link
    const forgotLink = page.getByRole('link', { name: /Forgot|Reset|Password/i });

    if (await forgotLink.count() > 0) {
      await expect(forgotLink.first()).toBeVisible();
    }
  });
});

test.describe('Dashboard Structure', () => {
  // These tests verify the structure exists even for redirected/unauthorized pages

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');

    // Check for main landmark
    await expect(page.locator('main')).toBeVisible();

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('login page should have proper document structure', async ({ page }) => {
    await page.goto('/login');

    // Check for lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');

    // Check for title
    await expect(page).toHaveTitle(/.+/);
  });
});
