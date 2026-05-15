import { test, expect } from '@playwright/test';

test.describe('Code Caterpillar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.keyboard.press('o');
    await expect(page).toHaveURL(/.*coding/);
  });

  test('Adding and clearing commands', async ({ page }) => {
    await page.getByTestId('add-forward').click();
    await page.getByTestId('add-rotate-cw').click();
    
    const items = page.getByTestId('program-item');
    await expect(items).toHaveCount(2);
    
    await expect(items.nth(0)).toContainText('FORWARD');
    await expect(items.nth(1)).toContainText('ROTATE CW');

    // Clear
    await page.getByTestId('clear-program').click();
    await expect(items).toHaveCount(0);
  });

  test('Removing a single command', async ({ page }) => {
    await page.getByTestId('add-forward').click();
    await page.getByTestId('add-rotate-cw').click();
    
    await page.getByTestId('remove-command').nth(0).click();
    
    const items = page.getByTestId('program-item');
    await expect(items).toHaveCount(1);
    await expect(items.nth(0)).toContainText('ROTATE CW');
  });

  test('Running a program (simple forward)', async ({ page }) => {
    // Initial position of bug-head
    const initialBox = await page.getByTestId('bug-head').boundingBox();
    if (!initialBox) throw new Error('Bug head not found');

    await page.getByTestId('add-forward').click();
    await page.getByTestId('run-program').click();

    // Wait for execution to finish (buttons re-enable)
    await expect(page.getByTestId('run-program')).not.toBeDisabled({ timeout: 10000 });

    const finalBox = await page.getByTestId('bug-head').boundingBox();
    if (!finalBox) throw new Error('Bug head not found');

    // It should have moved (initial heading is 0 which is UP, so y should decrease)
    expect(finalBox.y).toBeLessThan(initialBox.y);
  });

  test('Max command limit', async ({ page }) => {
    // Add 6 commands
    for (let i = 0; i < 6; i++) {
      await page.getByTestId('add-forward').click();
    }
    
    const items = page.getByTestId('program-item');
    await expect(items).toHaveCount(6);
    
    // Check if buttons are disabled (visually/property)
    await expect(page.getByTestId('add-forward')).toBeDisabled();

    // Attempt to add 7th (force click since it's disabled)
    await page.getByTestId('add-forward').click({ force: true });
    await expect(items).toHaveCount(6);
  });
});
