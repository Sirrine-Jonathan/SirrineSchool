import { test, expect } from '@playwright/test';

test.describe('Sirrine School Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('should navigate to Grace profile using "G" key', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    // Small delay to ensure React hydration
    await page.waitForTimeout(1000);
    await page.keyboard.press('g');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.getByText('Hello, Grace!')).toBeVisible();
  });

  test('should navigate to Charlie profile using "C" key', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('c');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.getByText('Hello, Charlie!')).toBeVisible();
  });

  test('should navigate dashboard subjects with arrow keys and Enter', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('g');
    await expect(page.getByText('Hello, Grace!')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500);
    // Default selection is Math (index 0). Press ArrowRight to move to Reading.
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/.*reading/, { timeout: 10000 });
    await expect(page.getByText('Skateboard Word Match')).toBeVisible();
  });

  test('should support numeric keys in Monster Truck Count game', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('c');
    await expect(page.getByText('Hello, Charlie!')).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('m'); // Shortcut for Math
    await expect(page).toHaveURL(/.*math\/charlie/, { timeout: 10000 });
    await expect(page.getByText('Monster Truck Count')).toBeVisible();

    await page.keyboard.press('1');
    // The feedback might be "SMASH!" or "Try Again!"
    await expect(page.locator('text=/SMASH|Try Again/')).toBeVisible({ timeout: 10000 });
  });

  test('should support numeric keys in Skateboard Word Match', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('g');
    await expect(page.getByText('Hello, Grace!')).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('r'); // Shortcut for Reading
    await expect(page).toHaveURL(/.*reading/, { timeout: 10000 });
    
    await page.keyboard.press('1');
    await expect(page.locator('text=/KICKFLIP|Try again/')).toBeVisible({ timeout: 10000 });
  });

  test('should open and close settings with keyboard', async ({ page }) => {
    await page.waitForSelector('h1:has-text("Sirrine School")', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('g');
    await expect(page.getByText('Hello, Grace!')).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('s'); // Shortcut for Settings
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 });
    
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Settings' })).not.toBeVisible({ timeout: 10000 });
  });
});