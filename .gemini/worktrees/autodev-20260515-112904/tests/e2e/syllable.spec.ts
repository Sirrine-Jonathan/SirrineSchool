import { test, expect } from '@playwright/test';

const WORDS_MAP: Record<string, number> = {
  'CAT': 1, 'DOG': 1, 'SUN': 1, 'FISH': 1,
  'APPLE': 2, 'TIGER': 2, 'PIZZA': 2, 'ROBOT': 2,
  'BANANA': 3, 'COMPUTER': 3, 'DINOSAUR': 3, 'GALAXY': 3,
  'HELICOPTER': 4, 'WATERMELON': 4, 'CATERPILLAR': 4, 'ELEVATOR': 4
};

test.describe('Syllable Smash Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible();
    
    // Navigate to Syllable Smash (Wait for the card to be visible and click it)
    const syllableCard = page.locator('[data-subject-id="syllable"]');
    await expect(syllableCard).toBeVisible();
    await syllableCard.click();
    
    await expect(page).toHaveURL(/.*syllable-smash/);
  });

  test('completing a word correctly', async ({ page }) => {
    // Wait for the game to load and get the word
    const wordElement = page.locator('h1');
    await expect(wordElement).toBeVisible();
    const word = (await wordElement.innerText()).trim();
    const syllables = WORDS_MAP[word];

    expect(syllables).toBeDefined();

    // Smash the area
    const smashArea = page.getByTestId('smash-area');
    for (let i = 0; i < syllables; i++) {
      await smashArea.click();
    }

    // Check results
    await page.getByTestId('check-button').click();

    await expect(page.getByText('SMASHED IT! 💥')).toBeVisible();
  });

  test('wrong number of taps shows error', async ({ page }) => {
    const wordElement = page.locator('h1');
    await expect(wordElement).toBeVisible();
    const word = (await wordElement.innerText()).trim();
    const syllables = WORDS_MAP[word];

    // Tap more than needed (or less if syllables > 1)
    const smashArea = page.getByTestId('smash-area');
    const wrongTaps = syllables + 1;
    
    for (let i = 0; i < wrongTaps; i++) {
      await smashArea.click();
    }

    await page.getByTestId('check-button').click();
    await expect(page.getByText('Try again! 🔄')).toBeVisible();
  });

  test('reset button clears taps', async ({ page }) => {
    const smashArea = page.getByTestId('smash-area');
    
    await smashArea.click();
    await smashArea.click();
    
    // Should have 2 dots
    await expect(page.getByTestId('syllable-dot')).toHaveCount(2);

    await page.getByText('Reset (R)').click();
    
    // Should have 0 dots
    await expect(page.getByTestId('syllable-dot')).toHaveCount(0);
  });
});
