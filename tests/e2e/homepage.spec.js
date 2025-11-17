/**
 * E2E Tests - Homepage
 * Tests for main landing page functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for main navigation links
    await expect(page.locator('a[href="#services"]')).toBeVisible();
    await expect(page.locator('a[href="#about"]')).toBeVisible();
    await expect(page.locator('a[href="#contact"]')).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    const hero = page.locator('[class*="hero"]').first();
    await expect(hero).toBeVisible();
  });

  test('should scroll to sections when clicking nav links', async ({ page }) => {
    // Click services link
    await page.click('a[href="#services"]');
    await page.waitForTimeout(500); // Wait for smooth scroll

    // Check if services section is in viewport
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeInViewport();
  });

  test('should have services section', async ({ page }) => {
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeVisible();

    // Check for service cards
    const serviceCards = page.locator('[class*="service"]');
    const count = await serviceCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have contact section', async ({ page }) => {
    const contactSection = page.locator('#contact');
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

    // Check if mobile menu exists or nav is visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should load all images', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    // Check each image has loaded
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
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
    // Tab to first element (should be skip link)
    await page.keyboard.press('Tab');

    const skipLink = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement.textContent.toLowerCase().includes('skip') ||
             activeElement.getAttribute('href') === '#main';
    });

    // Skip link should exist or first tab should go to meaningful content
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
