import { test, expect } from '@playwright/test';

test.describe('Reading Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible();
    await page.keyboard.press('r');
    await expect(page).toHaveURL(/.*reading/);
  });

  test('Sound → Word mode: selecting the correct button', async ({ page }) => {
    await expect(page.getByText('Sound → Word')).toBeVisible();

    const target = await page.locator('div[data-target]').getAttribute('data-target');
    if (!target) throw new Error('Target not found');

    // Click the button with the correct word
    await page.locator(`button[data-word="${target}"]`).click();

    await expect(page.getByText('KICKFLIP! 🛹')).toBeVisible();
  });

  test('Word → Sound mode: selecting a sound and checking answer', async ({ page }) => {
    // Toggle mode
    await page.getByRole('button', { name: /Sound → Word|Word → Sound/ }).click();
    await expect(page.getByText('Word → Sound')).toBeVisible();

    const target = await page.locator('div[data-target]').getAttribute('data-target');
    if (!target) throw new Error('Target not found');

    // In this mode, buttons show Volume2 icon, but we have data-word
    await page.locator(`button[data-word="${target}"]`).click();
    
    // Check answer button should appear
    const checkButton = page.getByRole('button', { name: 'CHECK ANSWER' });
    await expect(checkButton).toBeVisible();
    await checkButton.click();

    await expect(page.getByText('KICKFLIP! 🛹')).toBeVisible();
  });

  test('Mode toggle functionality via keyboard', async ({ page }) => {
    await expect(page.getByText('Sound → Word')).toBeVisible();
    await page.keyboard.press('m');
    await expect(page.getByText('Word → Sound')).toBeVisible();
    await page.keyboard.press('m');
    await expect(page.getByText('Sound → Word')).toBeVisible();
  });
});
