# Stilllight Photo Gallery - Testing Guide

## Overview

This project uses **Playwright** for end-to-end testing to ensure the photo gallery works correctly across different scenarios.

## Quick Start

```bash
# Build the project first
npm run build

# Run all tests
npm test

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# View the last test report
npm run test:e2e:report
```

## What Gets Tested

### 🖼️ Gallery Loading (8 tests)
- Page loads correctly with title and content
- Photos load from manifest API
- Loading states (spinner, photo count)
- Empty state when no photos
- Error handling for network failures
- Proper image attributes (lazy loading, alt text)

### 🔍 Lightbox Functionality (10 tests)
- Opens/closes lightbox correctly
- Displays full-size images and metadata
- Navigation between photos (prev/next buttons)
- Multiple ways to close (button, Escape, backdrop click)
- Button states at boundaries (first/last photo)
- Focus management

### ⌨️ Keyboard Navigation (8 tests)
- Arrow keys (Left/Right) for navigation
- Home/End keys to jump to first/last
- Tab key focus trapping inside dialog
- Escape key to close
- Debouncing for rapid key presses
- Boundary protection

### ♿ Accessibility (15 tests)
- ARIA attributes and roles
- Screen reader announcements
- Semantic HTML structure
- Keyboard navigation support
- Reduced motion preferences
- Focus management
- Descriptive labels and alt text

**Total: 41 automated tests**

## Test Files

```
tests/
├── e2e/
│   ├── gallery.spec.ts           # Gallery loading & display
│   ├── lightbox.spec.ts           # Lightbox interactions
│   ├── keyboard-navigation.spec.ts # Keyboard controls
│   └── accessibility.spec.ts      # A11y compliance
├── README.md                       # Detailed test documentation
└── TESTING_GUIDE.md               # This file
```

## CI/CD Integration

Tests automatically run in CI/CD pipelines. Configuration:
- Retries: 2 attempts in CI, 0 locally
- Parallelization: Single worker in CI
- Reports: HTML report generated
- Build fails: If any test fails

## Development Workflow

### Before Committing
```bash
# 1. Build the project
npm run build

# 2. Run tests
npm test
```

### Debugging a Failing Test
```bash
# Run with Playwright UI (interactive)
npm run test:e2e:ui

# Or run with debugging
npm run test:e2e:debug

# Or run specific test file
npx playwright test gallery.spec.ts
```

### Writing New Tests

1. Create `.spec.ts` file in `tests/e2e/`
2. Import Playwright:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Write tests with descriptive names
4. Use `test.beforeEach()` for setup
5. Group related tests with `test.describe()`

Example:
```typescript
test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something specific', async ({ page }) => {
    // Your test code
    const element = page.locator('.some-element');
    await expect(element).toBeVisible();
  });
});
```

## Browser Support

Currently configured for:
- ✅ Chromium (Chrome, Edge)

To add more browsers, edit `playwright.config.ts` and uncomment:
- Firefox
- WebKit (Safari)
- Mobile viewports

## Performance

- Tests run in parallel for speed
- Average test suite runtime: ~30-60 seconds
- Headless mode is faster than headed

## Troubleshooting

### Tests fail locally but pass in CI
- Ensure you've run `npm run build` first
- Check that preview server is running
- Clear cache: `rm -rf .cache/`

### Tests are slow
- Run specific test file instead of all tests
- Use headless mode (default)
- Increase timeout if needed in `playwright.config.ts`

### Browser not installed
```bash
npx playwright install chromium
```

## Best Practices

✅ **DO:**
- Write descriptive test names
- Test user workflows, not implementation
- Wait for elements before interacting
- Test error states and edge cases
- Include accessibility checks
- Keep tests independent

❌ **DON'T:**
- Hardcode delays (use `waitForSelector` instead)
- Test internal implementation details
- Share state between tests
- Write brittle selectors (prefer data-testid or accessible selectors)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

## Support

For questions or issues with tests:
1. Check test output and error messages
2. Run with `--debug` flag
3. Review Playwright documentation
4. Check test reports: `npm run test:e2e:report`
