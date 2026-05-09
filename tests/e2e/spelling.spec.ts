import { test, expect } from '@playwright/test';

test.describe('Spelling Bee Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Should be on dashboard by default (player user)
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to spelling bee and play a full game', async ({ page }) => {
    // Navigate to Spelling Bee
    await page.getByTestId('subject-card').filter({ hasText: 'Spelling' }).click();
    await expect(page).toHaveURL(/.*spelling-bee/);

    // Play 5 words
    for (let i = 0; i < 5; i++) {
      // Get the word to spell from the data-word attribute
      const listenButton = page.getByTestId('listen-button');
      const word = await listenButton.getAttribute('data-word');
      expect(word).toBeTruthy();

      // Type the word
      const input = page.getByTestId('spelling-input');
      await input.fill(word!);
      await page.getByTestId('submit-spelling').click();

      // Check for correct feedback
      await expect(page.getByTestId('spelling-feedback')).toContainText('Correct');

      // Wait for next word (the 2s timeout in the component)
      if (i < 4) {
        await expect(page.getByTestId('spelling-input')).toHaveValue('', { timeout: 5000 });
      }
    }

    // Check for Game Over
    await expect(page.getByText('Game Over!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('You spelled 5 out of 5 words correctly!')).toBeVisible();

    // Check Play Again
    await page.getByText('Play Again').click();
    await expect(page.getByText('Word 1 of 5')).toBeVisible();
  });

  test('should show error for incorrect spelling', async ({ page }) => {
    await page.getByTestId('subject-card').filter({ hasText: 'Spelling' }).click();

    const input = page.getByTestId('spelling-input');
    await input.fill('incorrectwordthatisnotright');
    await page.getByTestId('submit-spelling').click();

    await expect(page.getByTestId('spelling-feedback')).toContainText('Oops');
  });
});
