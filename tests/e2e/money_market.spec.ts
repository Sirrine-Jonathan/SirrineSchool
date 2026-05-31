import { test, expect } from '@playwright/test';

test.describe('Money Market Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math/money-market', { waitUntil: 'networkidle' });
    await expect(page.getByText('Money Market')).toBeVisible();
  });

  test('should display initial item and wallet state', async ({ page }) => {
    // The first item should always be the Apple priced at $0.75
    await expect(page.getByText('Apple')).toBeVisible();
    await expect(page.getByText('$0.75')).toBeVisible();
    
    // Initial wallet total should be $0.00
    await expect(page.getByText('Your Wallet')).toBeVisible();
    await expect(page.getByText('$0.00')).toBeVisible();
  });

  test('should allow adding and clearing money', async ({ page }) => {
    // Click $1 bill
    await page.getByRole('button', { name: '$1', exact: true }).click();
    await expect(page.getByText('$1.00')).toBeVisible();

    // Click 25¢ coin
    await page.getByRole('button', { name: '25¢', exact: true }).click();
    await expect(page.getByText('$1.25')).toBeVisible();

    // Click Clear button
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('$0.00')).toBeVisible();
  });

  test('should verify exact payment matches and shows success feedback', async ({ page }) => {
    // To pay $0.75 for Apple, click 25¢ three times
    const quarterBtn = page.getByRole('button', { name: '25¢', exact: true });
    await quarterBtn.click();
    await quarterBtn.click();
    await quarterBtn.click();

    await expect(page.getByText('$0.75')).toBeVisible();

    // Click Pay
    await page.getByRole('button', { name: 'Pay' }).click();

    // Check for success feedback
    const feedback = page.locator('div', { hasText: 'GREAT JOB! ⭐' });
    await expect(feedback).toBeVisible();
  });

  test('can go back to dashboard', async ({ page }) => {
    await page.click('button:has-text("Back")');
    await expect(page).toHaveURL('/dashboard');
  });
});
