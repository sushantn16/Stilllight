# E2E Tests

This directory contains end-to-end tests for the Stilllight photo gallery using Playwright.

## Test Structure

```
tests/e2e/
├── gallery.spec.ts           # Gallery loading and display tests
├── lightbox.spec.ts           # Lightbox functionality tests
├── keyboard-navigation.spec.ts # Keyboard navigation tests
└── accessibility.spec.ts      # Accessibility compliance tests
```

## Running Tests

### Run all tests (headless)
```bash
npm test
# or
npm run test:e2e
```

### Run tests with UI (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### Gallery Loading Tests
- ✅ Page loads with correct title
- ✅ Header and tagline display
- ✅ Loading spinner appears initially
- ✅ Photos load from manifest
- ✅ Photo count displays correctly
- ✅ Images have proper attributes (lazy loading, alt text)
- ✅ Empty state handling
- ✅ Error handling for failed fetches

### Lightbox Functionality Tests
- ✅ Opens lightbox on photo click
- ✅ Displays full-size image
- ✅ Shows photo title and metadata
- ✅ Closes on close button click
- ✅ Closes on Escape key
- ✅ Closes on backdrop click
- ✅ Navigates to next/previous photos
- ✅ Disables buttons at boundaries
- ✅ Restores focus after closing

### Keyboard Navigation Tests
- ✅ ArrowRight navigates to next photo
- ✅ ArrowLeft navigates to previous photo
- ✅ Home jumps to first photo
- ✅ End jumps to last photo
- ✅ Tab traps focus inside dialog
- ✅ Debouncing prevents rapid navigation issues
- ✅ Boundaries respected (can't go beyond first/last)

### Accessibility Tests
- ✅ Proper ARIA attributes on main content
- ✅ ARIA live regions for dynamic content
- ✅ Semantic list structure for gallery
- ✅ Proper dialog ARIA attributes
- ✅ Descriptive aria-labels on buttons
- ✅ Screen reader announcements in lightbox
- ✅ Proper heading hierarchy (h1, h2)
- ✅ Descriptive alt text on images
- ✅ Decorative elements hidden from screen readers
- ✅ Screen reader-only helper text
- ✅ Focus visible for keyboard users
- ✅ Reduced motion preference respected
- ✅ Sufficient color contrast

## CI/CD Integration

Tests are configured to run automatically in CI environments. The configuration:
- Retries failed tests 2 times in CI
- Uses single worker in CI for stability
- Generates HTML reports
- Fails build if tests fail

## Browser Support

Currently testing on:
- ✅ Chromium (Chrome/Edge)

To add more browsers, uncomment in `playwright.config.ts`:
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

## Writing New Tests

1. Create a new file in `tests/e2e/` with `.spec.ts` extension
2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Group related tests using `test.describe()`
4. Use `test.beforeEach()` for common setup
5. Write descriptive test names that explain what's being tested

## Best Practices

- Always wait for elements before interacting with them
- Use `page.waitForSelector()` for dynamic content
- Add appropriate timeouts for network requests
- Test both happy paths and error cases
- Include accessibility checks in all tests
- Keep tests independent and isolated
