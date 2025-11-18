/**
 * Unit Tests for Input Sanitizer
 */

import {
  encodeHTML,
  stripHTML,
  sanitizeAttribute,
  sanitizeURL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeInput,
  removeScripts,
} from '../../src/utils/input-sanitizer.js';

describe('Input Sanitizer', () => {
  describe('encodeHTML', () => {
    test('should encode HTML special characters', () => {
      expect(encodeHTML('<script>alert("xss")</script>')).not.toContain('<script>');
      expect(encodeHTML('Hello & goodbye')).toContain('&amp;');
      expect(encodeHTML('5 < 10 > 3')).toContain('&lt;');
      expect(encodeHTML('5 < 10 > 3')).toContain('&gt;');
    });

    test('should encode quotes', () => {
      expect(encodeHTML('"quoted"')).toContain('&quot;');
      expect(encodeHTML("'single'")).toContain('&#x27;');
    });

    test('should handle non-string input', () => {
      expect(encodeHTML(123)).toBe(123);
      expect(encodeHTML(null)).toBe(null);
      expect(encodeHTML(undefined)).toBe(undefined);
    });

    test('should handle empty string', () => {
      expect(encodeHTML('')).toBe('');
    });
  });

  describe('stripHTML', () => {
    test('should remove all HTML tags', () => {
      expect(stripHTML('<p>Hello</p>')).toBe('Hello');
      expect(stripHTML('<div><span>Nested</span></div>')).toBe('Nested');
      expect(stripHTML('<script>alert("xss")</script>')).toBe('');
    });

    test('should handle malicious HTML', () => {
      expect(stripHTML('<img src=x onerror="alert(1)">')).not.toContain('onerror');
      expect(stripHTML('<a href="javascript:void(0)">link</a>')).toBe('link');
    });

    test('should preserve text content', () => {
      expect(stripHTML('Plain text')).toBe('Plain text');
      expect(stripHTML('Text with <b>bold</b> and <i>italic</i>')).toBe('Text with bold and italic');
    });
  });

  describe('removeScripts', () => {
    test('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Hello';
      expect(removeScripts(malicious)).not.toContain('<script>');
      expect(removeScripts(malicious)).toContain('Hello');
    });

    test('should remove event handlers', () => {
      expect(removeScripts('<div onclick="alert(1)">Click</div>')).not.toContain('onclick');
      expect(removeScripts('<img src=x onerror="alert(1)">')).not.toContain('onerror');
    });

    test('should remove javascript: protocol', () => {
      expect(removeScripts('<a href="javascript:alert(1)">link</a>')).not.toContain('javascript:');
    });

    test('should handle case insensitivity', () => {
      expect(removeScripts('JAVASCRIPT:alert(1)')).not.toContain('JAVASCRIPT:');
      expect(removeScripts('JavaScript:alert(1)')).not.toContain('JavaScript:');
    });
  });

  describe('sanitizeURL', () => {
    test('should accept valid HTTP URLs', () => {
      expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
    });

    test('should accept valid HTTPS URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
    });

    test('should accept mailto URLs', () => {
      expect(sanitizeURL('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    test('should accept tel URLs', () => {
      expect(sanitizeURL('tel:+1234567890')).toBe('tel:+1234567890');
    });

    test('should reject javascript: URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
    });

    test('should reject data: URLs', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    test('should handle invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('not a url'); // Relative URL
      expect(sanitizeURL('')).toBe('');
    });

    test('should trim whitespace', () => {
      expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com/');
    });
  });

  describe('sanitizeEmail', () => {
    test('should accept valid email addresses', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
    });

    test('should convert to lowercase', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    test('should trim whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });

    test('should reject invalid email formats', () => {
      expect(sanitizeEmail('invalid')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
      expect(sanitizeEmail('test@')).toBe('');
      expect(sanitizeEmail('test @example.com')).toBe('');
    });

    test('should reject emails exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(sanitizeEmail(longEmail)).toBe('');
    });

    test('should handle non-string input', () => {
      expect(sanitizeEmail(123)).toBe('');
      expect(sanitizeEmail(null)).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    test('should accept valid Portuguese phone numbers', () => {
      expect(sanitizePhone('912345678')).toBe('912345678');
      expect(sanitizePhone('+351912345678')).toBe('+351912345678');
    });

    test('should remove formatting characters', () => {
      expect(sanitizePhone('912 345 678')).toBe('912345678');
      expect(sanitizePhone('(912) 345-678')).toBe('912345678');
    });

    test('should reject invalid formats', () => {
      expect(sanitizePhone('123')).toBe(''); // Too short
      expect(sanitizePhone('012345678')).toBe(''); // Starts with 0
      expect(sanitizePhone('abc123456')).toBe(''); // Contains letters
    });

    test('should handle non-string input', () => {
      expect(sanitizePhone(123)).toBe('');
      expect(sanitizePhone(null)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    test('should apply default sanitization', () => {
      const input = '  <script>alert("xss")</script>Hello  ';
      const result = sanitizeInput(input);

      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    test('should respect maxLength option', () => {
      const input = 'a'.repeat(1000);
      const result = sanitizeInput(input, { maxLength: 100 });

      expect(result.length).toBe(100);
    });

    test('should remove HTML when allowHTML is false', () => {
      const input = '<p>Hello</p>';
      const result = sanitizeInput(input, { allowHTML: false });

      expect(result).not.toContain('<p>');
    });

    test('should remove newlines when allowNewlines is false', () => {
      const input = 'Line 1\nLine 2\rLine 3';
      const result = sanitizeInput(input, { allowNewlines: false });

      expect(result).not.toContain('\n');
      expect(result).not.toContain('\r');
    });

    test('should trim whitespace when trim is true', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input, { trim: true });

      expect(result).toBe('Hello World');
    });

    test('should remove null bytes', () => {
      const input = 'Hello\0World';
      const result = sanitizeInput(input);

      expect(result).not.toContain('\0');
    });

    test('should remove SQL injection patterns', () => {
      const input = "'; DROP TABLE users;--";
      const result = sanitizeInput(input);

      expect(result).not.toContain('DROP');
      expect(result).not.toContain('--');
    });
  });

  describe('sanitizeAttribute', () => {
    test('should escape HTML attribute characters', () => {
      expect(sanitizeAttribute('value with "quotes"')).toContain('&quot;');
      expect(sanitizeAttribute("value with 'quotes'")).toContain('&#x27;');
      expect(sanitizeAttribute('value with <>')).toContain('&lt;');
    });

    test('should escape forward slashes', () => {
      expect(sanitizeAttribute('path/to/file')).toContain('&#x2F;');
    });

    test('should handle ampersands', () => {
      expect(sanitizeAttribute('Tom & Jerry')).toContain('&amp;');
    });
  });

  describe('XSS Prevention', () => {
    const xssVectors = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror="alert(1)">',
      '<a href="javascript:alert(1)">click</a>',
      '<iframe src="javascript:alert(1)">',
      '<body onload="alert(1)">',
      '<svg onload="alert(1)">',
      '<input onfocus="alert(1)" autofocus>',
      '"><script>alert(1)</script>',
      "';alert(1);//",
    ];

    xssVectors.forEach((vector, index) => {
      test(`should sanitize XSS vector ${index + 1}`, () => {
        const sanitized = sanitizeInput(vector, {
          allowHTML: false,
          allowScripts: false,
        });

        expect(sanitized.toLowerCase()).not.toContain('script');
        expect(sanitized.toLowerCase()).not.toContain('onerror');
        expect(sanitized.toLowerCase()).not.toContain('onload');
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeEmail('')).toBe('');
      expect(sanitizePhone('')).toBe('');
      expect(sanitizeURL('')).toBe('');
    });

    test('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });

    test('should handle very long input', () => {
      const longInput = 'a'.repeat(20000);
      const result = sanitizeInput(longInput, { maxLength: 10000 });

      expect(result.length).toBe(10000);
    });

    test('should handle unicode characters', () => {
      const unicode = 'Hello 世界 🌍';
      const result = sanitizeInput(unicode);

      expect(result).toContain('世界');
      expect(result).toContain('🌍');
    });

    test('should handle special Portuguese characters', () => {
      const portuguese = 'João, José, Ação, Educação';
      const result = sanitizeInput(portuguese);

      expect(result).toContain('João');
      expect(result).toContain('José');
      expect(result).toContain('Ação');
    });
  });
});
