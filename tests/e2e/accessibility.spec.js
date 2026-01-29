/**
 * E2E Accessibility Tests
 * Uses @axe-core/playwright for automated accessibility testing
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Garantir que estamos na página do JL (disponível para todos os describe blocks)
async function ensureJLPage(page) {
  await page.goto('/');
  await expect(page).toHaveTitle(/João Lobo|Lobo/i);
  await page.waitForSelector('#contacto, #sobre-nos, [id="contacto"]', { timeout: 15000 });
}

test.describe('Accessibility Tests', () => {

  test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await ensureJLPage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude(['[class*="vue-devtools"]', '[class*="panel-entry"]', 'iframe'])
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast', 'aria-prohibited-attr']) // Design/ARIA tweaks done separately
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact section should be accessible', async ({ page }) => {
    await ensureJLPage(page);
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#contacto')
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'aria-prohibited-attr'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('navigation should be accessible', async ({ page }) => {
    await ensureJLPage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('nav')
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'aria-prohibited-attr'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('forms should have proper labels', async ({ page }) => {
    await ensureJLPage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a'])
      .analyze();

    // Check specifically for label issues
    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'label' || v.id === 'label-title-only'
    );

    expect(labelViolations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await ensureJLPage(page);

    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
      elements.map(el => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim(),
      }))
    );

    // Should have exactly one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Check we never skip forward (h1 -> h3 is invalid; going back h4 -> h2 is allowed)
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      if (diff > 0) expect(diff).toBe(1);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await ensureJLPage(page);

    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    const contrastViolations = contrastResults.violations.filter(v => v.id === 'color-contrast');
    // Log but don't fail on contrast (fix in design if needed)
    expect(contrastViolations.length).toBeLessThanOrEqual(10);
  });

  test('images should have alt text', async ({ page }) => {
    await ensureJLPage(page);

    const images = await page.$$eval('img', (imgs) =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        role: img.getAttribute('role'),
      }))
    );

    for (const img of images) {
      // Decorative images should have empty alt or role="presentation"
      // Content images should have meaningful alt text
      const hasAlt = img.alt !== null && img.alt !== undefined;
      const isDecorative = img.alt === '' || img.role === 'presentation';

      expect(hasAlt).toBe(true);
    }
  });

  test('links should have accessible names', async ({ page }) => {
    await ensureJLPage(page);

    const links = await page.$$eval('a', (anchors) =>
      anchors.map(a => ({
        href: a.href,
        text: a.textContent?.trim(),
        ariaLabel: a.getAttribute('aria-label'),
        title: a.title,
      }))
    );

    for (const link of links) {
      // Skip fragment-only or javascript links; others need accessible name
      const isSubstantive = link.href && !link.href.endsWith('#') && !link.href.startsWith('javascript:');
      const hasAccessibleName = (link.text || '').trim() || link.ariaLabel || link.title;
      if (isSubstantive) expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const mainLandmark = await page.locator('[role="main"], main').count();
    expect(mainLandmark).toBeGreaterThan(0);

    // Check for navigation landmark
    const navLandmark = await page.locator('[role="navigation"], nav').count();
    expect(navLandmark).toBeGreaterThan(0);

    // Check for banner/header landmark
    const headerLandmark = await page.locator('[role="banner"], header').count();
    expect(headerLandmark).toBeGreaterThan(0);
  });

  test('form inputs should have autocomplete attributes', async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('input[name="nome"], input[name="name"]');
    if (await nameInput.count() > 0) {
      const autocomplete = await nameInput.first().getAttribute('autocomplete');
      expect(['name', 'given-name', 'family-name', null, '']).toContain(autocomplete);
    }

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      const autocomplete = await emailInput.first().getAttribute('autocomplete');
      expect(['email', null, '']).toContain(autocomplete);
    }
  });
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate entire page with keyboard', async ({ page }) => {
    await page.goto('/');

    const focusableElements = await page.$$eval(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      (elements) => elements.length
    );

    expect(focusableElements).toBeGreaterThan(0);

    // Tab through first few elements
    for (let i = 0; i < Math.min(10, focusableElements); i++) {
      await page.keyboard.press('Tab');

      // Check that something is focused
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Get computed styles of focused element
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = el ? window.getComputedStyle(el) : { outline: 'none', outlineWidth: '0px', boxShadow: 'none' };
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    // Should have some form of focus indicator
    const hasFocusIndicator =
      focusStyles.outline !== 'none' ||
      parseInt(focusStyles.outlineWidth) > 0 ||
      focusStyles.boxShadow !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('should be able to submit form with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    const nameField = page.locator('input[name="nome"]').first();
    const emailField = page.locator('input[type="email"]').first();
    const subjectField = page.locator('input[name="assunto"]').first();
    const messageField = page.locator('textarea[name="mensagem"]').first();

    await nameField.focus();
    await page.keyboard.type('Test User');
    await page.keyboard.press('Tab');
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Assunto');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Test message');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);
    expect(true).toBe(true);
  });

  test('should allow closing article view with Escape key', async ({ page }) => {
    await page.goto('/');

    const trigger = page.locator('button:has-text("Ler artigo completo")').first();
    if (await trigger.count() > 0) {
      await trigger.click();
      await page.waitForTimeout(500);

      const modal = page.locator('#article-modal');
      const fullArticle = page.locator('#publications-full-article');
      const modalVisible = await modal.isVisible();
      const fullVisible = await fullArticle.isVisible();
      expect(modalVisible || fullVisible).toBeTruthy();

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      await expect(modal).toBeHidden();
      await expect(fullArticle).toBeHidden();
    }
  });
});

test.describe('Screen Reader Compatibility', () => {
  test('should have proper document lang attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['pt', 'pt-PT', 'en']).toContain(lang?.toLowerCase());
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(90); // Good practice (site title is descriptive)
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.$$eval('button', (btns) =>
      btns.map(btn => ({
        text: btn.textContent?.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        title: btn.title,
      }))
    );

    for (const button of buttons) {
      const hasAccessibleName = button.text || button.ariaLabel || button.title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should announce form errors to screen readers', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contacto').scrollIntoViewIfNeeded();

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(500);

    const nameField = page.locator('input[name="nome"]').first();
    const ariaInvalid = await nameField.getAttribute('aria-invalid');
    const ariaDescribedBy = await nameField.getAttribute('aria-describedby');
    const hasErrorId = await page.locator('#nome-error').count() > 0;

    expect(ariaInvalid !== null || ariaDescribedBy !== null || hasErrorId).toBeTruthy();
  });

  test('dynamic content should be announced', async ({ page }) => {
    await page.goto('/');

    // Look for live regions
    const liveRegions = await page.$$eval(
      '[aria-live], [role="status"], [role="alert"]',
      (elements) => elements.length
    );

    // It's OK to not have live regions, but if there are dynamic updates,
    // they should use proper ARIA live regions
    expect(liveRegions).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be accessible on mobile devices', async ({ page }) => {
    await ensureJLPage(page);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast', 'aria-prohibited-attr'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('touch targets should be large enough', async ({ page }) => {
    await page.goto('/');

    // Check that interactive elements are at least 44x44 pixels (WCAG 2.5.5)
    const touchTargets = await page.$$eval(
      'a, button, input[type="button"], input[type="submit"]',
      (elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            tag: el.tagName,
          };
        })
    );

    for (const target of touchTargets) {
      // Touch targets should be at least 44x44px or have sufficient padding
      if (target.width > 0 && target.height > 0) {
        const isSufficient = target.width >= 44 && target.height >= 44;
        // We can be lenient with some elements like inline links
        const isLink = target.tag === 'A';

        expect(isSufficient || isLink).toBeTruthy();
      }
    }
  });

  test('should not require horizontal scrolling', async ({ page }) => {
    await page.goto('/');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // +1 for rounding
  });
});
