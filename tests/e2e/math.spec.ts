import { test, expect } from '@playwright/test';

test.describe('Math Games', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('Arithmetic Arena: problem generation and numeric entry', async ({ page }) => {
    await page.keyboard.press('a');
    await expect(page).toHaveURL(/.*arithmetic/);
    await expect(page.getByText('Arithmetic Arena')).toBeVisible();

    // Wait for animation and stability
    await page.waitForTimeout(1000);

    const aLocator = page.getByTestId('num-a');
    const bLocator = page.getByTestId('num-b');
    const opLocator = page.getByTestId('op');

    await expect(aLocator).toBeVisible();
    await expect(bLocator).toBeVisible();

    const a = parseInt(await aLocator.innerText());
    const b = parseInt(await bLocator.innerText());
    const op = await opLocator.getAttribute('data-op');

    const expected = op === '+' ? a + b : a - b;

    // Enter answer using keypad in the UI to ensure events fire correctly
    const expectedStr = expected.toString();
    for (const char of expectedStr) {
      await page.getByTestId(`key-${char}`).click();
    }
    
    await page.getByTestId('key-go').click();

    // Check for feedback
    await expect(page.getByTestId('feedback')).toBeVisible({ timeout: 10000 });
    await expect(feedback).toContainText('AWESOME');
    
    // Verify feedback disappears
    await expect(feedback).not.toBeVisible({ timeout: 5000 });
  });

  test('Multiplication: problem generation and numeric entry', async ({ page }) => {
    await page.keyboard.press('m');
    await expect(page).toHaveURL(/.*multiplication/);
    await expect(page.getByText('Multiplication')).toBeVisible();

    const crates = parseInt(await page.getByTestId('num-crates').innerText());
    const items = parseInt(await page.getByTestId('items-per-crate').innerText());
    const expected = crates * items;

    // Enter answer using keypad in the UI
    const expectedStr = expected.toString();
    for (const char of expectedStr) {
      await page.getByRole('button', { name: char, exact: true }).click();
    }
    
    await page.getByRole('button', { name: 'SEND' }).click();

    await expect(page.getByTestId('feedback')).toBeVisible();
    await expect(page.getByTestId('feedback')).toContainText('LIFT OFF');
  });

  test('Counting: range slider and URL parameter persistence', async ({ page }) => {
    await page.keyboard.press('c');
    await expect(page).toHaveURL(/.*counting/);
    
    const slider = page.getByTestId('range-slider');
    await slider.fill('5');
    
    // Verify URL parameter
    await expect(page).toHaveURL(/.*max=5/);
    
    // Reload and verify persistence
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*max=5/);
    await expect(page.getByTestId('range-slider')).toHaveValue('5');

    // Test a problem
    const truckGrid = page.getByTestId('target-count');
    const trucks = truckGrid.locator('svg');
    const count = await trucks.count();
    
    // Use manual fill for speed here, but onsubmit form
    await page.getByTestId('answer-input').fill(count.toString());
    await page.getByTestId('submit-btn').click();

    await expect(page.getByTestId('feedback')).toBeVisible();
    await expect(page.getByTestId('feedback')).toContainText('SMASH');
  });
});
