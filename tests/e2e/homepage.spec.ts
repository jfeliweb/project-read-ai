import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is present
    await expect(page.locator('h1')).toContainText('Home Page');
  });

  test('should have a clickable button', async ({ page }) => {
    await page.goto('/');

    const button = page.getByRole('button', { name: /click me/i });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });
});
