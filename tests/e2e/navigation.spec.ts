import { test, expect } from '@playwright/test';

test.describe('Sirrine School Keyboard Navigation & App Factory Baseline', () => {
  const DEFAULT_TIMEOUT = 10000;

  test.beforeEach(async ({ page }) => {
    // App now defaults to 'player' profile, so it auto-redirects to /dashboard
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('should boot directly to unified dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard/, { timeout: DEFAULT_TIMEOUT });
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('should navigate dashboard subjects with arrow keys and Enter', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible({ timeout: DEFAULT_TIMEOUT });

    // Wait for hydration
    await page.waitForTimeout(500);
    
    // Default selection is Counting (index 0). 
    // Press ArrowRight 6 times to move to Reading (index 6).
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*reading/, { timeout: DEFAULT_TIMEOUT });
    await expect(page.getByText('Reading')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('should launch Counting game via "C" key and support numeric input', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    
    await page.waitForTimeout(500);
    await page.keyboard.press('c'); // Shortcut for Counting
    await expect(page).toHaveURL(/.*counting/, { timeout: DEFAULT_TIMEOUT });
    await expect(page.getByText('Counting')).toBeVisible({ timeout: DEFAULT_TIMEOUT });

    // Ensure the input field exists
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('should launch Coding game via "O" key and support visual programming', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    
    await page.waitForTimeout(500);
    await page.keyboard.press('o'); // Shortcut for Coding (since C is Counting)
    await expect(page).toHaveURL(/.*coding/, { timeout: DEFAULT_TIMEOUT });
    await expect(page.getByText('Code Caterpillar')).toBeVisible({ timeout: DEFAULT_TIMEOUT });

    // Ensure controls exist
    await expect(page.getByText('FORW')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });

  test('should open and close settings with keyboard', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible({ timeout: DEFAULT_TIMEOUT });
    
    await page.waitForTimeout(500);
    await page.keyboard.press('s'); // Shortcut for Settings
    
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: DEFAULT_TIMEOUT });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Settings' })).not.toBeVisible({ timeout: DEFAULT_TIMEOUT });
  });
});
