import { test, expect } from '@playwright/test';

test.describe('Pattern Pop Game', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup: go to home and create/select a user
    await page.goto('/');
    
    // If we redirected to dashboard, we're good
    if (page.url().includes('dashboard')) return;

    // Check if we need to select a user
    const userCard = page.getByTestId('user-card');
    if (await userCard.count() > 0) {
      await userCard.first().click();
    }
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to Pattern Pop and play one round', async ({ page }) => {
    // Find Pattern Pop card and click it
    await page.getByTestId('subject-card').filter({ hasText: 'Patterns' }).click();
    await expect(page).toHaveURL(/.*math\/patterns/);
    await expect(page.getByText('Pattern Pop')).toBeVisible();

    // Get the pattern items
    const items = page.getByTestId(/pattern-item-/);
    const count = await items.count();
    expect(count === 4 || count === 6).toBeTruthy();

    // Identify the hidden item (the one with "?")
    const lastItem = items.last();
    await expect(lastItem).toHaveText('?');

    // To find the correct answer, we'd need to know the pattern logic.
    // Since it's random, we can try to "cheat" by looking at the component state if possible,
    // but in E2E we usually simulate user behavior.
    // For this test, let's just ensure we can click an option and see feedback.
    
    const options = page.getByTestId(/option-/);
    await expect(options).toHaveCount(4);

    // Click the first option
    await options.first().click();

    // Check for feedback (either "PERFECT" or "OOPS")
    const feedback = page.getByTestId('feedback');
    await expect(feedback).toBeVisible();
  });

  test('should support keyboard shortcut P to launch', async ({ page }) => {
    await page.keyboard.press('p');
    await expect(page).toHaveURL(/.*math\/patterns/);
    await expect(page.getByText('Pattern Pop')).toBeVisible();
  });
});
