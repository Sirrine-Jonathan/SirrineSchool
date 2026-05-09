import { test, expect } from '@playwright/test';

test.describe('Rhyme Time Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Navigate to Rhyme Time (Keyboard 'h')
    await page.keyboard.press('h');
    await expect(page).toHaveURL(/.*rhyme-time/);
  });

  test('selecting the correct rhyming word', async ({ page }) => {
    // Wait for the game to load
    await expect(page.getByText('What rhymes with...')).toBeVisible();

    // Find the correct button using data-correct="true"
    const correctButton = page.locator('button[data-correct="true"]');
    await expect(correctButton).toBeVisible();
    
    await correctButton.click();

    await expect(page.getByText('PERFECT RHYME! 🎵')).toBeVisible();
  });

  test('selecting the wrong word then the correct one', async ({ page }) => {
    await expect(page.getByText('What rhymes with...')).toBeVisible();

    // Find a wrong button
    const wrongButton = page.locator('button[data-correct="false"]').first();
    await expect(wrongButton).toBeVisible();
    
    await wrongButton.click();
    await expect(page.getByText('Try again! 🔄')).toBeVisible();

    // Wait for feedback to disappear
    await page.waitForTimeout(2000);

    // Click the correct one
    const correctButton = page.locator('button[data-correct="true"]');
    await correctButton.click();
    await expect(page.getByText('PERFECT RHYME! 🎵')).toBeVisible();
  });

  test('keyboard navigation and selection', async ({ page }) => {
    await expect(page.getByText('What rhymes with...')).toBeVisible();

    // Use keys 1, 2, 3 to find the correct one
    // We can iterate through the buttons and check data-correct
    const buttons = await page.locator('button[data-word]').all();
    let correctIndex = -1;
    for (let i = 0; i < buttons.length; i++) {
      const isCorrect = await buttons[i].getAttribute('data-correct');
      if (isCorrect === 'true') {
        correctIndex = i + 1;
        break;
      }
    }

    if (correctIndex !== -1) {
      await page.keyboard.press(correctIndex.toString());
      await expect(page.getByText('PERFECT RHYME! 🎵')).toBeVisible();
    }
  });
});
