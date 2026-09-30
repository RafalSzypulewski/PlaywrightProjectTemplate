import { expect, test } from '@playwright/test';

test.describe('example', { tag: '@smoke' }, () => {
  test('home page shows the Playwright title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Playwright/);
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  });
});
