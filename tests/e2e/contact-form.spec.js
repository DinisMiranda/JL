/**
 * E2E Tests - Contact Form
 * Tests for contact form functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form#contact-form, form[name="contact"]');
    await expect(form).toBeVisible();
  });

  test('should have all required fields', async ({ page }) => {
    // Check for name field
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    await expect(nameField).toBeVisible();

    // Check for email field
    const emailField = page.locator('input[name="email"], input[type="email"]');
    await expect(emailField).toBeVisible();

    // Check for message field
    const messageField = page.locator('textarea[name="message"], textarea');
    await expect(messageField).toBeVisible();

    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();

    // Try to submit empty form
    await submitButton.click();

    // Wait for validation or error message
    await page.waitForTimeout(500);

    // Check if HTML5 validation prevents submission or shows errors
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    const isRequired = await nameField.getAttribute('required');

    expect(isRequired !== null || await page.locator('.error').count() > 0).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    const emailField = page.locator('input[name="email"], input[type="email"]').first();

    // Enter invalid email
    await emailField.fill('invalid-email');
    await emailField.blur();

    // Check for validation
    await page.waitForTimeout(300);

    const validity = await emailField.evaluate((el) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('should submit form with valid data', async ({ page }) => {
    // Fill form with valid data
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const messageField = page.locator('textarea[name="message"], textarea').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('This is a test message for E2E testing.');

    // Submit form
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Check for success message or form reset
    const successIndicator = await page.locator('.success, .alert-success, [class*="success"]').count() > 0 ||
                             await nameField.inputValue() === '';

    expect(successIndicator).toBeTruthy();
  });

  test('should sanitize input', async ({ page }) => {
    const nameField = page.locator('input[name="name"], input[type="text"]').first();

    // Try to enter malicious input
    await nameField.fill('<script>alert("XSS")</script>');
    await nameField.blur();

    await page.waitForTimeout(300);

    // Check if input was sanitized
    const value = await nameField.inputValue();
    expect(value).not.toContain('<script>');
  });

  test('should be accessible via keyboard', async ({ page }) => {
    // Tab to first form field
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    await nameField.focus();

    // Fill using keyboard
    await page.keyboard.type('Test User');
    await page.keyboard.press('Tab');

    // Should move to email field
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailField).toBeFocused();

    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');

    // Should move to message field
    const messageField = page.locator('textarea[name="message"], textarea').first();
    await expect(messageField).toBeFocused();
  });

  test('should have proper labels', async ({ page }) => {
    // Check that all inputs have associated labels
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const messageField = page.locator('textarea[name="message"], textarea').first();

    // Check for labels or aria-label
    for (const field of [nameField, emailField, messageField]) {
      const id = await field.getAttribute('id');
      const ariaLabel = await field.getAttribute('aria-label');
      const placeholder = await field.getAttribute('placeholder');

      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;

      expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('should handle phone number field if present', async ({ page }) => {
    const phoneField = page.locator('input[name="phone"], input[type="tel"]');

    if (await phoneField.count() > 0) {
      // Test Portuguese phone number format
      await phoneField.first().fill('912 345 678');
      await phoneField.first().blur();

      await page.waitForTimeout(300);

      const value = await phoneField.first().inputValue();
      expect(value).toMatch(/^\d{9}$|^\+?351\d{9}$/);
    }
  });

  test('should show loading state during submission', async ({ page }) => {
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const messageField = page.locator('textarea[name="message"], textarea').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await messageField.fill('Test message');

    // Submit and check for loading state
    await submitButton.click();

    // Check if button is disabled or shows loading
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    const buttonText = await submitButton.textContent();
    const hasLoadingIndicator = buttonText?.toLowerCase().includes('sending') ||
                                buttonText?.toLowerCase().includes('loading') ||
                                isDisabled;

    expect(hasLoadingIndicator).toBeTruthy();
  });
});

test.describe('Contact Form - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('should show error for invalid email', async ({ page }) => {
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailField.fill('invalid.email');
    await submitButton.click();

    await page.waitForTimeout(500);

    // Check for error message or invalid state
    const hasError = await page.locator('.error, .invalid, [aria-invalid="true"]').count() > 0 ||
                     !(await emailField.evaluate((el) => el.validity.valid));

    expect(hasError).toBeTruthy();
  });

  test('should clear errors when correcting input', async ({ page }) => {
    const emailField = page.locator('input[name="email"], input[type="email"]').first();

    // Enter invalid email
    await emailField.fill('invalid');
    await emailField.blur();
    await page.waitForTimeout(300);

    // Enter valid email
    await emailField.fill('valid@example.com');
    await emailField.blur();
    await page.waitForTimeout(300);

    const isValid = await emailField.evaluate((el) => el.validity.valid);
    expect(isValid).toBe(true);
  });
});

test.describe('Contact Form - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be usable on mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();

    const form = page.locator('form#contact-form, form').first();
    await expect(form).toBeVisible();

    // Check that form fields are accessible
    const nameField = page.locator('input[name="name"], input[type="text"]').first();
    await nameField.click();
    await nameField.fill('Mobile Test');

    const value = await nameField.inputValue();
    expect(value).toBe('Mobile Test');
  });

  test('should have appropriate input types for mobile', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();

    // Email should have type="email" for mobile keyboard
    const emailField = page.locator('input[name="email"]').first();
    const emailType = await emailField.getAttribute('type');
    expect(emailType).toBe('email');

    // Phone should have type="tel" for mobile keyboard (if present)
    const phoneField = page.locator('input[name="phone"]');
    if (await phoneField.count() > 0) {
      const phoneType = await phoneField.first().getAttribute('type');
      expect(phoneType).toBe('tel');
    }
  });
});
