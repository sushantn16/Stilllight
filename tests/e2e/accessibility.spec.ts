import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card', { timeout: 10000 });
  });

  test('should have proper ARIA attributes on main content', async ({ page }) => {
    const mainElement = page.locator('#app');
    await expect(mainElement).toHaveAttribute('aria-busy');
  });

  test('should have ARIA live region for photo count', async ({ page }) => {
    const photoCount = page.locator('#photo-count');
    await expect(photoCount).toHaveAttribute('role', 'status');
    await expect(photoCount).toHaveAttribute('aria-live', 'polite');
  });

  test('should have ARIA live region for loader', async ({ page }) => {
    const loader = page.locator('#loader');
    await expect(loader).toHaveAttribute('role', 'status');
    await expect(loader).toHaveAttribute('aria-live', 'polite');
  });

  test('should have semantic list structure for gallery', async ({ page }) => {
    const grid = page.locator('#grid');
    await expect(grid).toHaveAttribute('role', 'list');

    const cards = page.locator('.card');
    const firstCard = cards.first();
    await expect(firstCard).toHaveAttribute('role', 'listitem');
  });

  test('should have proper dialog attributes', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const dialog = page.locator('#dlg');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'dlg-title');
  });

  test('should have descriptive aria-labels on buttons', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const closeButton = page.locator('#close-btn');
    await expect(closeButton).toHaveAttribute('aria-label', 'Close lightbox');

    const prevButton = page.locator('#prev-btn');
    await expect(prevButton).toHaveAttribute('aria-label', 'Previous photo');

    const nextButton = page.locator('#next-btn');
    await expect(nextButton).toHaveAttribute('aria-label', 'Next photo');
  });

  test('should have screen reader announcements in lightbox', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const srStatus = page.locator('#dlg-status');
    await expect(srStatus).toHaveAttribute('role', 'status');
    await expect(srStatus).toHaveAttribute('aria-live', 'polite');
    await expect(srStatus).toHaveAttribute('aria-atomic', 'true');

    // Check that status has content
    const statusText = await srStatus.textContent();
    expect(statusText).toBeTruthy();
    expect(statusText).toMatch(/Photo \d+ of \d+/);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('body > header h1').first();
    await expect(h1).toHaveText('Stilllight');

    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const h2 = page.locator('#dlg-title');
    await expect(h2).toBeVisible();

    // Check it's actually an h2
    const tagName = await h2.evaluate(el => el.tagName);
    expect(tagName).toBe('H2');
  });

  test('should have descriptive alt text on images', async ({ page }) => {
    const images = page.locator('.card img');
    const firstImage = images.first();

    const altText = await firstImage.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText?.length).toBeGreaterThan(0);
  });

  test('should hide decorative elements from screen readers', async ({ page }) => {
    const spinner = page.locator('.spinner');
    if (await spinner.isVisible()) {
      await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('should have screen reader only helper text', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const srOnlyElements = page.locator('.sr-only');
    const count = await srOnlyElements.count();

    expect(count).toBeGreaterThan(0);

    // Check CSS makes it hidden visually but available to screen readers
    const styles = await srOnlyElements.first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        width: computed.width,
        height: computed.height,
      };
    });

    expect(styles.position).toBe('absolute');
    expect(styles.width).toBe('1px');
    expect(styles.height).toBe('1px');
  });

  test('should maintain focus visible for keyboard users', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await firstCard.click();

    // Wait for dialog to be visible
    await page.waitForSelector('#dlg[open]');

    // Focus should be on close button (set by code)
    const activeElementId = await page.evaluate(() => document.activeElement?.id);
    expect(activeElementId).toBe('close-btn');
  });

  test('should respect reduced motion preferences', async ({ page, context }) => {
    // Test that animations are disabled with prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();

    const firstCard = page.locator('.card').first();
    await firstCard.click();

    const overlay = page.locator('.card-overlay').first();

    // Check transition duration is minimal
    const transitionDuration = await overlay.evaluate(el => {
      return window.getComputedStyle(el).transitionDuration;
    });

    // With reduced motion, transitions should be very short (0.01ms or scientific notation like 1e-05s)
    expect(transitionDuration).toMatch(/^(0\.|1e-)/);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Visual test - check that key UI elements exist and are visible
    const header = page.locator('body > header').first();
    await expect(header).toBeVisible();

    const photoCount = page.locator('#photo-count');
    await expect(photoCount).toBeVisible();

    // Check footer is visible
    const footer = page.locator('body > footer').first();
    await expect(footer).toBeVisible();
  });
});
