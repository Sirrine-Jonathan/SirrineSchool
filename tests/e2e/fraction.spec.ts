import { test, expect } from '@playwright/test';

test.describe('Fraction Pizza Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Should already be logged in as 'player'
    await page.keyboard.press('f'); // Shortcut for Fractions
    await expect(page).toHaveURL(/.*fractions/);
    await expect(page.getByText('Fraction Pizza')).toBeVisible();
  });

  test('should be able to complete a fraction problem', async ({ page }) => {
    // Wait for the instruction card to be visible
    const instruction = page.locator('h2:has-text("Give the customer")');
    await expect(instruction).toBeVisible();

    const fractionText = await instruction.innerText();
    // Match something like "1/2"
    const match = fractionText.match(/(\d+)\/(\d+)/);
    if (!match) throw new Error('Could not find fraction in text: ' + fractionText);

    const numerator = parseInt(match[1]);
    const denominator = parseInt(match[2]);

    console.log(`Target: ${numerator}/${denominator}`);

    // Find the pizza slices. They are <path> elements inside the PizzaSVG.
    // In FractionPizza.tsx, the slices are rendered in a loop.
    // We can use the index to click them.
    const slices = page.locator('svg g path');
    await expect(slices).toHaveCount(denominator);

    // Click 'numerator' number of slices
    for (let i = 0; i < numerator; i++) {
      await slices.nth(i).click();
    }

    // Click GO!
    await page.getByRole('button', { name: 'GO!' }).click();

    // Check for success feedback
    const feedback = page.getByText('DELICIOUS!');
    await expect(feedback).toBeVisible();
  });

  test('should show error feedback for incorrect answer', async ({ page }) => {
    const instruction = page.locator('h2:has-text("Give the customer")');
    const fractionText = await instruction.innerText();
    const match = fractionText.match(/(\d+)\/(\d+)/);
    if (!match) throw new Error('Could not find fraction in text');

    const numerator = parseInt(match[1]);
    const denominator = parseInt(match[2]);

    const slices = page.locator('svg g path');
    
    // Select WRONG number of slices (e.g. 0 if numerator > 0, or denominator if numerator < denominator)
    const wrongCount = numerator === denominator ? 0 : numerator + 1;
    
    if (wrongCount > 0) {
        for (let i = 0; i < Math.min(wrongCount, denominator); i++) {
            await slices.nth(i).click();
        }
    }

    await page.getByRole('button', { name: 'GO!' }).click();

    const feedback = page.getByText('Try again!');
    await expect(feedback).toBeVisible();
  });
});
