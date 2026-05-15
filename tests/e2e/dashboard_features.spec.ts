import { test, expect } from '@playwright/test';

test.describe('Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
  });

  test('should focus search input when "/" is pressed', async ({ page }) => {
    await page.keyboard.press('/');
    const searchInput = page.locator('#game-search');
    await expect(searchInput).toBeFocused();
  });

  test('should filter games by search query', async ({ page }) => {
    const searchInput = page.locator('#game-search');
    await searchInput.fill('Reading');
    
    const subjectCards = page.locator('[data-testid="subject-card"]');
    await expect(subjectCards).toHaveCount(1);
    await expect(subjectCards.first()).toContainText('Reading');
  });

  test('should filter games by category', async ({ page }) => {
    await page.getByRole('button', { name: 'Math', exact: true }).click();
    
    const subjectCards = page.locator('[data-testid="subject-card"]');
    // Math category has Counting, Arithmetic, Fractions, Clock, Patterns, Multiplication
    const counts = await subjectCards.count();
    expect(counts).toBeGreaterThanOrEqual(6);
  });

  test('should mark games as "Played" after visiting them', async ({ page }) => {
    // Initially many games should be "NEW"
    await expect(page.locator('text=NEW').first()).toBeVisible();

    // Click on Counting
    await page.locator('[data-subject-id="counting"]').click();
    await expect(page).toHaveURL(/.*counting/);

    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Switch to Recent sort to see "Played" badge
    await page.getByRole('button', { name: 'Recent' }).click();
    
    // Counting should now have "Played" badge
    const countingCard = page.locator('[data-subject-id="counting"]');
    await expect(countingCard.locator('text=Played')).toBeVisible();
  });
});
