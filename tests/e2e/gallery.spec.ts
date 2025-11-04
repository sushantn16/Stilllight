import { test, expect } from '@playwright/test';

test.describe('Photo Gallery Loading', () => {
  test('should load the page with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Stilllight');
  });

  test('should display header and tagline', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    await expect(heading).toHaveText('Stilllight');

    const tagline = page.locator('header p');
    await expect(tagline).toHaveText('Capturing moments, preserving memories');
  });

  test('should show loading spinner initially', async ({ page }) => {
    await page.goto('/');

    const loader = page.locator('#loader');
    await expect(loader).toBeVisible();

    const spinner = page.locator('.spinner');
    await expect(spinner).toBeVisible();
  });

  test('should load and display photos from manifest', async ({ page }) => {
    await page.goto('/');

    // Wait for photos to load
    await page.waitForSelector('.card', { timeout: 10000 });

    // Check that loader is hidden
    const loader = page.locator('#loader');
    await expect(loader).toBeHidden();

    // Check that photos are displayed
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display photo count', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.card', { timeout: 10000 });

    const photoCount = page.locator('#photo-count');
    const countText = await photoCount.textContent();

    expect(countText).toMatch(/\d+ photo(s)?/);
  });

  test('should display images with correct attributes', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.card img', { timeout: 10000 });

    const firstImage = page.locator('.card img').first();
    await expect(firstImage).toHaveAttribute('loading', 'lazy');
    await expect(firstImage).toHaveAttribute('alt');
  });

  test('should handle empty state when no photos', async ({ page }) => {
    // Mock empty manifest BEFORE navigating to the page
    await page.route('**/*manifest.json*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] })
      });
    });

    await page.goto('/');

    // Wait for loader to disappear
    await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });

    // Check that empty state is visible
    const emptyMessage = page.locator('#empty');
    await expect(emptyMessage).toHaveClass(/visible/);
    await expect(emptyMessage).toHaveText('No photos yet.');
  });
});
