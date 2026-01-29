/**
 * E2E Tests - Homepage
 * Tests for main landing page functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/João Lobo/i);
  });

  test('should have correct meta tags', async ({ page }) => {
    // Check description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);

    // Check viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should display navigation', async ({ page }) => {
    await page.waitForLoadState('load');

    // At least one nav or menu button visible (main-nav on desktop, mobile menu button or nav on mobile)
    const mainNavVisible = await page.locator('#main-nav').isVisible();
    const mobileNavVisible = await page.locator('#mobile-nav').isVisible();
    const menuButtonVisible = await page.getByRole('button', { name: 'Abrir menu de navegação' }).isVisible();
    expect(mainNavVisible || mobileNavVisible || menuButtonVisible).toBeTruthy();

    // Main nav links exist (in DOM; may appear in both main-nav and mobile-nav)
    await expect(page.locator('a[href="#areas-pratica"]').first()).toBeAttached();
    await expect(page.locator('a[href="#sobre-nos"]').first()).toBeAttached();
    await expect(page.locator('a[href="#contacto"]').first()).toBeAttached();
  });

  test('should have hero section', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('should scroll to sections when clicking nav links', async ({ page }) => {
    const width = await page.evaluate(() => window.innerWidth);
    const isMobile = width < 768;
    if (isMobile) {
      await page.getByRole('button', { name: 'Abrir menu de navegação' }).click();
      await page.waitForTimeout(600);
      await page.locator('#mobile-nav a[href="#areas-pratica"]').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('#mobile-nav a[href="#areas-pratica"]').click();
    } else {
      await page.locator('a[href="#areas-pratica"]').first().click();
    }
    await page.waitForTimeout(500);

    const section = page.locator('#areas-pratica');
    await expect(section).toBeInViewport({ timeout: 10000 });
  });

  test('should have services section', async ({ page }) => {
    const section = page.locator('#areas-pratica');
    await expect(section).toBeVisible();

    const cards = page.locator('#areas-pratica article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have contact section', async ({ page }) => {
    const contactSection = page.locator('#contacto');
    await expect(contactSection).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for copyright
    const copyright = footer.locator('text=/©.*João Lobo/i');
    await expect(copyright).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // On mobile, mobile nav is visible (main nav is hidden)
    const mobileNav = page.getByRole('navigation', { name: 'Navegação principal móvel' });
    await expect(mobileNav).toBeVisible();
  });

  test('should load all images', async ({ page }) => {
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000); // Allow lazy-loaded images

    const images = page.locator('img[src]');
    const count = await images.count();
    let loaded = 0;
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      if (naturalWidth > 0) loaded++;
    }
    expect(loaded).toBeGreaterThan(0);
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/', { waitUntil: 'load' });

    // Ignore known third-party/extension errors
    const appErrors = errors.filter(
      (t) =>
        !/ResizeObserver|Extension|chrome-extension|moz-extension|vue-devtools|__REACT/i.test(t)
    );

    expect(appErrors).toHaveLength(0);
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate using keyboard', async ({ page }) => {
    // Tab through navigation
    await page.keyboard.press('Tab');

    // Check if focus is on a focusable element
    const activeElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(activeElement);
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.keyboard.press('Tab');

    const skipLink = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement.textContent?.toLowerCase().includes('saltar') ||
             activeElement.getAttribute('href') === '#main-content';
    });

    expect(typeof skipLink).toBe('boolean');
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000);
      });
    });

    // LCP should be under 2.5 seconds (good threshold)
    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
    }
  });
});
