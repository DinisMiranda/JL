# Testing Guide
## João Lobo Advogados - Comprehensive Testing Documentation

**Last Updated:** November 17, 2025
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Infrastructure](#testing-infrastructure)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Visual Regression Testing](#visual-regression-testing)
8. [Performance Testing](#performance-testing)
9. [Code Quality](#code-quality)
10. [Running Tests](#running-tests)
11. [Writing Tests](#writing-tests)
12. [CI/CD Integration](#cicd-integration)
13. [Browser Compatibility](#browser-compatibility)
14. [Test Coverage](#test-coverage)
15. [Troubleshooting](#troubleshooting)

---

## Overview

This project implements a comprehensive testing strategy covering all aspects of quality assurance:

- **Unit Tests** - Test individual functions and utilities
- **Integration Tests** - Test component interactions
- **E2E Tests** - Test complete user workflows
- **Accessibility Tests** - Ensure WCAG compliance
- **Visual Regression** - Detect unintended UI changes
- **Performance Tests** - Monitor and maintain performance

### Testing Philosophy

- **Test-Driven Development** - Write tests before implementation when possible
- **Comprehensive Coverage** - Aim for >70% code coverage
- **Fast Feedback** - Tests should run quickly in development
- **Reliable** - Tests should be deterministic and not flaky
- **Meaningful** - Tests should verify actual behavior, not implementation details

---

## Testing Infrastructure

### Tools and Frameworks

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Jest** | Unit & integration testing | [jestjs.io](https://jestjs.io/) |
| **@testing-library** | DOM testing utilities | [testing-library.com](https://testing-library.com/) |
| **Playwright** | E2E & visual testing | [playwright.dev](https://playwright.dev/) |
| **axe-core** | Accessibility testing | [deque.com/axe](https://www.deque.com/axe/) |
| **Lighthouse CI** | Performance auditing | [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) |
| **ESLint** | Code quality & linting | [eslint.org](https://eslint.org/) |
| **Prettier** | Code formatting | [prettier.io](https://prettier.io/) |
| **pa11y** | CLI accessibility testing | [pa11y.org](https://pa11y.org/) |

### File Structure

```
tests/
├── setup.js                   # Jest setup and mocks
├── __mocks__/
│   ├── styleMock.js          # CSS import mocks
│   └── fileMock.js           # File import mocks
├── unit/
│   ├── input-sanitizer.test.js
│   ├── validation.test.js
│   └── ...
├── integration/
│   └── ...
└── e2e/
    ├── homepage.spec.js
    ├── contact-form.spec.js
    └── accessibility.spec.js

scripts/
├── validate-html.js           # HTML validation script
└── validate-a11y.js          # Accessibility validation script

Config Files:
├── jest.config.js            # Jest configuration
├── playwright.config.js      # Playwright configuration
├── lighthouserc.js          # Lighthouse CI configuration
├── .eslintrc.js             # ESLint rules
└── .prettierrc              # Prettier formatting
```

---

## Unit Testing

### Overview

Unit tests verify individual functions and utilities in isolation.

### Configuration

**jest.config.js:**
```javascript
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js', 'server/**/*.js'],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Writing Unit Tests

**Example: Input Sanitizer Tests**

```javascript
import { sanitizeInput, sanitizeEmail } from '../../src/utils/input-sanitizer.js';

describe('sanitizeInput', () => {
  test('should remove script tags', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeInput(malicious, { allowHTML: false });

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  test('should handle null input', () => {
    expect(sanitizeInput(null)).toBe(null);
  });
});
```

### Best Practices

1. **Test One Thing** - Each test should verify a single behavior
2. **Use Descriptive Names** - Test names should explain what they test
3. **Arrange-Act-Assert** - Follow AAA pattern
4. **Test Edge Cases** - Include null, undefined, empty, very long inputs
5. **Mock External Dependencies** - Use Jest mocks for APIs, etc.

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage

# Run specific test file
npm test input-sanitizer

# Run only unit tests
npm run test:unit
```

### Coverage Reports

After running `npm run test:coverage`:

```
coverage/
├── lcov-report/      # HTML report (open index.html)
├── lcov.info         # LCOV format for CI
└── coverage-final.json
```

View HTML report: Open `coverage/lcov-report/index.html` in browser

---

## Integration Testing

### Overview

Integration tests verify that multiple components work together correctly.

### Example Integration Test

```javascript
describe('Form Integration', () => {
  test('should validate and sanitize form data', () => {
    // Setup form
    document.body.innerHTML = `
      <form id="test-form">
        <input name="email" type="email" />
        <button type="submit">Submit</button>
      </form>
    `;

    // Create sanitizer
    const form = document.getElementById('test-form');
    const sanitizer = new FormSanitizer(form);

    // Test validation
    const result = sanitizer.validate({
      email: { required: true, email: true }
    });

    expect(result.valid).toBe(false);
  });
});
```

### Running Integration Tests

```bash
# Run integration tests only
npm run test:integration
```

---

## End-to-End Testing

### Overview

E2E tests verify complete user workflows using Playwright.

### Configuration

**playwright.config.js:**
```javascript
{
  testDir: './tests/e2e',
  timeout: 30000,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
  }
}
```

### Writing E2E Tests

**Example: Homepage Test**

```javascript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/João Lobo/i);
  });

  test('should navigate to services', async ({ page }) => {
    await page.click('a[href="#services"]');
    await expect(page.locator('#services')).toBeInViewport();
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific browser only
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### E2E Test Reports

After running tests:

```bash
# View HTML report
npx playwright show-report
```

Reports include:
- Test results
- Screenshots on failure
- Videos of failing tests
- Traces for debugging

---

## Accessibility Testing

### Overview

Accessibility tests ensure WCAG 2.1 AA compliance using multiple tools.

### Automated A11y Tests

**With Playwright and axe-core:**

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Manual A11y Validation

```bash
# Run pa11y accessibility tests
npm run validate:a11y

# With screenshots
npm run validate:a11y -- --screenshot

# Verbose output
npm run validate:a11y -- --verbose
```

### Accessibility Checklist

Manual testing checklist:

#### Keyboard Navigation
- [ ] All interactive elements accessible via Tab
- [ ] Focus indicators clearly visible
- [ ] Logical tab order
- [ ] Skip to main content link
- [ ] No keyboard traps

#### Screen Reader
- [ ] All images have alt text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Form labels associated with inputs
- [ ] Meaningful link text (no "click here")
- [ ] ARIA landmarks (main, nav, footer)

#### Visual
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] No information conveyed by color alone
- [ ] Text resizable up to 200%
- [ ] Touch targets ≥ 44x44 pixels (mobile)

#### Forms
- [ ] All inputs have labels
- [ ] Required fields indicated
- [ ] Error messages clear and associated with fields
- [ ] Success confirmation provided

### Running A11y Tests

```bash
# E2E accessibility tests
npm run test:a11y

# CLI accessibility validation
npm run validate:a11y
```

---

## Visual Regression Testing

### Overview

Visual regression tests detect unintended UI changes.

### Setup with Playwright

**Tag tests for visual testing:**

```javascript
test('homepage visual regression @visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Running Visual Tests

```bash
# Run visual regression tests
npm run test:visual

# Update baseline screenshots
npx playwright test --update-snapshots --grep @visual
```

### Screenshot Comparison

Playwright uses pixelmatch for pixel-by-pixel comparison:

```javascript
await expect(page).toHaveScreenshot('component.png', {
  maxDiffPixels: 100,    // Allow up to 100 different pixels
  threshold: 0.2,        // Threshold for color difference
});
```

---

## Performance Testing

### Lighthouse CI

Automated performance auditing on every build.

### Configuration

**lighthouserc.js:**
```javascript
{
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      }
    }
  }
}
```

### Running Performance Tests

```bash
# Run Lighthouse CI
npm run lighthouse

# Build and test
npm run build && npm run lighthouse
```

### Performance Benchmarks

Target metrics:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP | < 1.8s | 1.8s - 3.0s | > 3.0s |
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTI | < 3.8s | 3.8s - 7.3s | > 7.3s |

### Monitoring

```javascript
// Manual performance measurement
const startTime = performance.now();
await page.goto('/');
const loadTime = performance.now() - startTime;

expect(loadTime).toBeLessThan(3000); // 3 seconds
```

---

## Code Quality

### ESLint

**Configuration:** `.eslintrc.js`

```javascript
{
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error'
  }
}
```

### Running ESLint

```bash
# Lint and fix
npm run lint

# Lint only (no fix)
npm run lint:check

# Lint specific file
npx eslint src/utils/input-sanitizer.js
```

### Prettier

**Configuration:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Running Prettier

```bash
# Format all files
npm run format

# Check formatting without changing
npm run format:check

# Format specific file
npx prettier --write src/utils/input-sanitizer.js
```

### HTML Validation

```bash
# Validate HTML
npm run validate:html

# Verbose output
npm run validate:html -- --verbose
```

---

## Running Tests

### Quick Reference

```bash
# Development
npm test                    # Run unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# E2E Tests
npm run test:e2e           # All browsers
npm run test:e2e:headed    # Visible browser
npm run test:e2e:ui        # Interactive mode

# Specific Test Types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:a11y          # Accessibility tests

# All Tests
npm run test:all           # Run everything

# Code Quality
npm run lint               # Lint and fix
npm run format             # Format code
npm run lighthouse         # Performance audit
npm run validate:html      # HTML validation
npm run validate:a11y      # A11y validation

# Pre-commit
npm run precommit          # Lint + format + test
```

### Test Execution Order

For CI/CD, run tests in this order:

1. **Linting & Formatting**
   ```bash
   npm run lint:check && npm run format:check
   ```

2. **Unit Tests**
   ```bash
   npm run test:unit
   ```

3. **Integration Tests**
   ```bash
   npm run test:integration
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

6. **Accessibility Tests**
   ```bash
   npm run test:a11y
   npm run validate:a11y
   ```

7. **Performance Tests**
   ```bash
   npm run lighthouse
   ```

---

## Writing Tests

### Test Structure

```javascript
// Describe block groups related tests
describe('Component Name', () => {
  // beforeEach runs before each test
  beforeEach(() => {
    // Setup code
  });

  // afterEach runs after each test
  afterEach(() => {
    // Cleanup code
  });

  // Individual test
  test('should do something specific', () => {
    // Arrange - Setup
    const input = 'test data';

    // Act - Execute
    const result = functionUnderTest(input);

    // Assert - Verify
    expect(result).toBe('expected output');
  });

  // Nested describe for sub-features
  describe('SubFeature', () => {
    test('should handle edge case', () => {
      // Test code
    });
  });
});
```

### Assertions

**Jest Matchers:**
```javascript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).not.toBe(unexpected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 2);

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Functions
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);
```

**Playwright Assertions:**
```javascript
// Page
await expect(page).toHaveTitle(/Title/);
await expect(page).toHaveURL(/url-pattern/);

// Locators
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeFocused();
await expect(locator).toContainText('text');
await expect(locator).toHaveText('exact text');
await expect(locator).toHaveValue('value');
await expect(locator).toHaveAttribute('name', 'value');
```

### Mocking

**Mock Functions:**
```javascript
// Create mock
const mockFn = jest.fn();

// Mock return value
mockFn.mockReturnValue('value');

// Mock implementation
mockFn.mockImplementation((arg) => arg * 2);

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('arg');
```

**Mock Modules:**
```javascript
// Mock entire module
jest.mock('../../src/utils/api.js', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' })
}));

// Use mock
import { fetchData } from '../../src/utils/api.js';
const data = await fetchData();
expect(data).toEqual({ data: 'test' });
```

---

## CI/CD Integration

### GitHub Actions Example

**.github/workflows/test.yml:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint:check

      - name: Format check
        run: npm run format:check

      - name: Unit tests
        run: npm run test:coverage

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Browser Compatibility

### Tested Browsers

| Browser | Desktop | Mobile | Version |
|---------|---------|--------|---------|
| Chrome | ✅ | ✅ | Latest 2 |
| Firefox | ✅ | ❌ | Latest 2 |
| Safari | ✅ | ✅ | Latest 2 |
| Edge | ✅ | ❌ | Latest 2 |

### Cross-Browser Testing

```bash
# Test specific browser
npx playwright test --project=firefox

# Test all browsers
npm run test:e2e

# Mobile only
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

### Browser-Specific Issues

Track browser-specific issues in tests:

```javascript
test('feature works in all browsers', async ({ browserName, page }) => {
  test.skip(browserName === 'webkit', 'Feature not supported in WebKit');

  // Test code
});
```

---

## Test Coverage

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Coverage Metrics

- **Statements:** % of executable statements run
- **Branches:** % of conditional branches taken
- **Functions:** % of functions called
- **Lines:** % of lines executed

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
{
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Improving Coverage

1. **Identify Gaps:**
   ```bash
   npm run test:coverage
   # Review uncovered lines in HTML report
   ```

2. **Write Tests:**
   - Focus on red (uncovered) lines
   - Test edge cases
   - Test error handling

3. **Verify:**
   ```bash
   npm run test:coverage
   # Check improved coverage %
   ```

---

## Troubleshooting

### Common Issues

#### Tests Failing Locally

```bash
# Clear caches
npm run test -- --clearCache

# Update snapshots
npm run test -- --updateSnapshot

# Run specific test
npm test -- -t "test name pattern"
```

#### Playwright Installation Issues

```bash
# Reinstall browsers
npx playwright install --force

# Install system dependencies
npx playwright install-deps
```

#### Port Already in Use

```bash
# Kill process on port 5173
# Linux/Mac:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### Flaky Tests

```javascript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds

  // Test code
});

// Add wait for network idle
await page.waitForLoadState('networkidle');

// Use waitFor with conditions
await expect(locator).toBeVisible({ timeout: 10000 });
```

#### Memory Issues

```bash
# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096

# Or in package.json script
"test": "NODE_OPTIONS=--max-old-space-size=4096 jest"
```

### Debug Mode

**Jest:**
```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

**Playwright:**
```bash
# Debug mode
npx playwright test --debug

# Headed mode (see browser)
npx playwright test --headed

# Slow motion
npx playwright test --headed --slow-mo=1000
```

### Getting Help

- **Jest:** [jestjs.io/help](https://jestjs.io/help)
- **Playwright:** [playwright.dev/community](https://playwright.dev/community/welcome)
- **Testing Library:** [testing-library.com/help](https://testing-library.com/help)

---

## Best Practices Summary

1. **Write Tests First** - TDD when possible
2. **Keep Tests Fast** - Mock external dependencies
3. **Test Behavior, Not Implementation** - Don't test internal details
4. **One Assertion Per Test** - Keep tests focused
5. **Use Descriptive Names** - Make test purpose clear
6. **Clean Up** - Use afterEach to reset state
7. **Avoid Test Interdependence** - Each test should run independently
8. **Test Edge Cases** - null, undefined, empty, very long
9. **Mock External Services** - Don't rely on external APIs
10. **Review Coverage** - Aim for >70% but focus on critical paths

---

**For questions or issues with testing, please contact the development team.**
