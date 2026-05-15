import { test, expect } from '@playwright/test';

test.describe('Shortkey Samurai Game', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page - app auto-redirects to dashboard if user is set
    await page.goto('/');
    
    // Wait for dashboard or home page
    const isDashboard = await page.url().includes('dashboard');
    if (!isDashboard) {
        // If we are on home page, click Grace or Charlie
        const grace = page.locator('text=Grace');
        if (await grace.isVisible()) {
            await grace.click();
        } else {
            // Might be 'Player' or other
            const player = page.locator('text=Player');
            if (await player.isVisible()) {
                await player.click();
            }
        }
    }
    
    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('can navigate to Shortkey Samurai from dashboard', async ({ page }) => {
    // Click on Shortkey Samurai card
    await page.click('text=Shortkey Samurai');
    
    // Should be on the game page
    await expect(page).toHaveURL(/.*typing\/shortkey/);
    await expect(page.locator('text=Shortkey Samurai')).toBeVisible();
  });

  test('can play the game with shortcuts', async ({ page }) => {
    await page.click('text=Shortkey Samurai');
    
    // Wait for the scroll to appear
    await expect(page.locator('h3')).toBeVisible();
    const label = await page.locator('h3').textContent();
    expect(label).toBeTruthy();
    
    // Get the keys to press
    if (label === 'Copy') {
        await page.keyboard.down('Control');
        await page.keyboard.press('c');
        await page.keyboard.up('Control');
    } else if (label === 'Paste') {
        await page.keyboard.down('Control');
        await page.keyboard.press('v');
        await page.keyboard.up('Control');
    } else if (label === 'Cut') {
        await page.keyboard.down('Control');
        await page.keyboard.press('x');
        await page.keyboard.up('Control');
    } else if (label === 'Select All') {
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
    } else if (label === 'Save') {
        await page.keyboard.down('Control');
        await page.keyboard.press('s');
        await page.keyboard.up('Control');
    } else if (label === 'Undo') {
        await page.keyboard.down('Control');
        await page.keyboard.press('z');
        await page.keyboard.up('Control');
    } else if (label === 'Find') {
        await page.keyboard.down('Control');
        await page.keyboard.press('f');
        await page.keyboard.up('Control');
    }

    // After one success, score should be 1
    await expect(page.locator('text=Score: 1')).toBeVisible();
  });

  test('can navigate back home from the game', async ({ page }) => {
    await page.click('text=Shortkey Samurai');
    
    // Click Back button in GameContainer
    await page.click('text=Back');
    
    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
