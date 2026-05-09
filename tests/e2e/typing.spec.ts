import { test, expect } from '@playwright/test';

test.describe('Typing Game (Astro Typer)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.keyboard.press('t');
    await expect(page).toHaveURL(/.*typing/);
  });

  test('Meteor spawning and typing correct letters', async ({ page }) => {
    await expect(page.getByText('Score: 0')).toBeVisible();

    // Wait for at least one meteor to spawn
    const meteor = page.getByTestId('meteor-letter').first();
    await expect(meteor).toBeVisible({ timeout: 15000 });

    const letter = await meteor.innerText();
    await page.keyboard.press(letter);

    // Score should increase
    await expect(page.getByText('Score: 1')).toBeVisible();
  });

  test('Speed slider persistence', async ({ page }) => {
    const slider = page.getByTestId('speed-slider');
    await expect(slider).toBeVisible();

    // Change speed
    await slider.fill('8');

    // Verify UI reflects change
    await expect(page.getByTestId('config-panel').locator('span').getByText('8')).toBeVisible();

    // Reload and verify persistence
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('speed-slider')).toHaveValue('8');
  });
});
