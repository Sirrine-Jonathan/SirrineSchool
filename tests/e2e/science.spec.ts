import { test, expect } from '@playwright/test';

test.describe('Animal Habitats Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h2:has-text("Sirrine School")')).toBeVisible();
    // Navigate to Habitats (Keyboard 'i')
    await page.keyboard.press('i');
    await expect(page).toHaveURL(/.*science\/habitats/);
  });

  test('sorting an animal correctly', async ({ page }) => {
    // Wait for game to load
    const animalCard = page.locator('[data-testid="animal-card"]');
    await expect(animalCard).toBeVisible();
    
    // Get animal metadata
    const animalName = await animalCard.getAttribute('data-animal-name');
    if (!animalName) throw new Error('Animal name not found');
    
    const habitatMap: Record<string, string> = {
        'Whale': 'ocean', 'Shark': 'ocean', 'Octopus': 'ocean', 'Sea Turtle': 'ocean', 'Crab': 'ocean', 'Dolphin': 'ocean',
        'Deer': 'forest', 'Bear': 'forest', 'Squirrel': 'forest', 'Fox': 'forest', 'Owl': 'forest', 'Raccoon': 'forest',
        'Camel': 'desert', 'Snake': 'desert', 'Scorpion': 'desert', 'Lizard': 'desert', 'Cactus': 'desert', 'Desert': 'desert'
    };
    
    const targetHabitat = habitatMap[animalName];
    const habitatBox = page.locator(`[data-testid="habitat-${targetHabitat}"]`);
    
    // Perform drag and drop
    await animalCard.dragTo(habitatBox);
    
    // Check for success feedback
    await expect(page.getByText('AMAZING! 🌟')).toBeVisible();
  });

  test('sorting an animal incorrectly', async ({ page }) => {
    const animalCard = page.locator('[data-testid="animal-card"]');
    await expect(animalCard).toBeVisible();
    
    const animalName = await animalCard.getAttribute('data-animal-name');
    if (!animalName) throw new Error('Animal name not found');

    const habitatMap: Record<string, string> = {
        'Whale': 'ocean', 'Shark': 'ocean', 'Octopus': 'ocean', 'Sea Turtle': 'ocean', 'Crab': 'ocean', 'Dolphin': 'ocean',
        'Deer': 'forest', 'Bear': 'forest', 'Squirrel': 'forest', 'Fox': 'forest', 'Owl': 'forest', 'Raccoon': 'forest',
        'Camel': 'desert', 'Snake': 'desert', 'Scorpion': 'desert', 'Lizard': 'desert', 'Cactus': 'desert', 'Desert': 'desert'
    };
    
    const correctHabitat = habitatMap[animalName];
    const wrongHabitat = correctHabitat === 'ocean' ? 'desert' : 'ocean';
    const habitatBox = page.locator(`[data-testid="habitat-${wrongHabitat}"]`);
    
    await animalCard.dragTo(habitatBox);
    
    await expect(page.getByText('Try Again! 🦊')).toBeVisible();
  });
});
