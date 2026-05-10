import { test, expect } from '@playwright/test';

test.describe('Sentence Scramble Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible();
    // Navigate to Scramble (Keyboard 'e')
    await page.keyboard.press('e');
    await expect(page).toHaveURL(/.*sentence-scramble/);
  });

  test('completing a sentence correctly', async ({ page }) => {
    // Wait for game to load
    await expect(page.locator('[data-target]')).toBeVisible();
    
    // Get the target sentence
    const targetSentenceStr = await page.locator('[data-target]').getAttribute('data-target');
    if (!targetSentenceStr) throw new Error('Target sentence not found');
    const targetWords = targetSentenceStr.split(' ');

    // Click words in order
    for (const word of targetWords) {
      const wordButton = page.locator(`button[data-word="${word}"]`).first();
      await wordButton.click();
    }

    // Check for success feedback
    await expect(page.getByText('AWESOME! 🌟')).toBeVisible();
  });

  test('keyboard interaction', async ({ page }) => {
    await expect(page.locator('[data-target]')).toBeVisible();
    
    const targetSentenceStr = await page.locator('[data-target]').getAttribute('data-target');
    if (!targetSentenceStr) throw new Error('Target sentence not found');
    const targetWords = targetSentenceStr.split(' ');

    // For the first word, find its index in the scrambled grid
    const firstWord = targetWords[0];
    const buttons = await page.locator('button[data-word]').all();
    let firstWordIndex = -1;
    for (let i = 0; i < buttons.length; i++) {
        const word = await buttons[i].getAttribute('data-word');
        if (word === firstWord) {
            firstWordIndex = i + 1;
            break;
        }
    }

    if (firstWordIndex !== -1) {
        await page.keyboard.press(firstWordIndex.toString());
        // Verify the first word slot is filled (simplified check)
        await expect(page.locator('button[data-word]').nth(firstWordIndex - 1)).toHaveCSS('opacity', '0');
    }
  });

  test('wrong word feedback', async ({ page }) => {
    await expect(page.locator('[data-target]')).toBeVisible();
    
    const targetSentenceStr = await page.locator('[data-target]').getAttribute('data-target');
    if (!targetSentenceStr) throw new Error('Target sentence not found');
    const targetWords = targetSentenceStr.split(' ');
    const firstWord = targetWords[0];

    // Find a word that is NOT the first word
    const wrongWordButton = page.locator(`button[data-word]:not([data-word="${firstWord}"])`).first();
    await wrongWordButton.click();

    await expect(page.getByText('Try again! 🔄')).toBeVisible();
  });
});
