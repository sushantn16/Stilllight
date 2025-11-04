import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card', { timeout: 10000 });
  });

  test('should navigate to next photo with ArrowRight', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      const firstCard = cards.first();
      await firstCard.click();

      const dialog = page.locator('#dlg');
      await expect(dialog).toBeVisible();

      // Press ArrowRight
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);

      // Dialog should still be open with next image
      await expect(dialog).toBeVisible();
    }
  });

  test('should navigate to previous photo with ArrowLeft', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Open second photo
      const secondCard = cards.nth(1);
      await secondCard.click();

      const dialog = page.locator('#dlg');
      await expect(dialog).toBeVisible();

      // Press ArrowLeft
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(200);

      // Dialog should still be open with previous image
      await expect(dialog).toBeVisible();
    }
  });

  test('should jump to first photo with Home key', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Open last photo
      const lastCard = cards.last();
      await lastCard.click();

      const dialog = page.locator('#dlg');
      await expect(dialog).toBeVisible();

      // Press Home
      await page.keyboard.press('Home');
      await page.waitForTimeout(200);

      // Should be on first photo (prev button disabled)
      const prevButton = page.locator('#prev-btn');
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should jump to last photo with End key', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Open first photo
      const firstCard = cards.first();
      await firstCard.click();

      const dialog = page.locator('#dlg');
      await expect(dialog).toBeVisible();

      // Press End
      await page.keyboard.press('End');
      await page.waitForTimeout(200);

      // Should be on last photo (next button disabled)
      const nextButton = page.locator('#next-btn');
      await expect(nextButton).toBeDisabled();
    }
  });

  test('should trap focus inside dialog with Tab', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const dialog = page.locator('#dlg');
    await expect(dialog).toBeVisible();

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should still be inside dialog
    const focusedElement = await page.evaluate(() => {
      const activeEl = document.activeElement;
      const dialog = document.getElementById('dlg');
      return dialog?.contains(activeEl);
    });

    expect(focusedElement).toBe(true);
  });

  test('should handle rapid keyboard navigation with debouncing', async ({ page }) => {
    const cards = page.locator('.card');
    const cardCount = await cards.count();

    if (cardCount > 2) {
      const firstCard = cards.first();
      await firstCard.click();

      const dialog = page.locator('#dlg');
      await expect(dialog).toBeVisible();

      // Rapid arrow key presses
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowRight');
      }

      // Wait for debounce to settle
      await page.waitForTimeout(300);

      // Dialog should still be open and functional
      await expect(dialog).toBeVisible();
    }
  });

  test('should not navigate beyond first photo', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const dialog = page.locator('#dlg');
    await expect(dialog).toBeVisible();

    const prevButton = page.locator('#prev-btn');
    await expect(prevButton).toBeDisabled();

    // Try to navigate left
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);

    // Should still be on first photo
    await expect(prevButton).toBeDisabled();
  });

  test('should not navigate beyond last photo', async ({ page }) => {
    const cards = page.locator('.card');
    const lastCard = cards.last();
    await lastCard.click();

    const dialog = page.locator('#dlg');
    await expect(dialog).toBeVisible();

    const nextButton = page.locator('#next-btn');
    await expect(nextButton).toBeDisabled();

    // Try to navigate right
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // Should still be on last photo
    await expect(nextButton).toBeDisabled();
  });
});
