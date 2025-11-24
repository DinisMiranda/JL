/**
 * Unit Tests for Server Validation Middleware
 */

import {
  encodeHTML,
  stripHTML,
  preventSQLInjection,
  preventScriptInjection,
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  isValidURL,
  validateInput,
  validationSchemas,
} from '../../server/middleware/validation.js';

describe('Server Validation Middleware', () => {
  describe('encodeHTML', () => {
    test('should encode HTML entities', () => {
      expect(encodeHTML('<script>')).toBe('&lt;script&gt;');
      expect(encodeHTML('&')).toBe('&amp;');
      expect(encodeHTML('"test"')).toBe('&quot;test&quot;');
    });

    test('should handle non-string input', () => {
      expect(encodeHTML(123)).toBe(123);
      expect(encodeHTML(null)).toBe(null);
    });
  });

  describe('stripHTML', () => {
    test('should remove HTML tags', () => {
      expect(stripHTML('<p>Hello</p>')).toBe('Hello');
      expect(stripHTML('<div>Test</div>')).toBe('Test');
    });

    test('should handle nested tags', () => {
      expect(stripHTML('<div><span>Nested</span></div>')).toBe('Nested');
    });
  });

  describe('preventSQLInjection', () => {
    test('should remove SQL keywords', () => {
      expect(preventSQLInjection('SELECT * FROM users')).not.toContain('SELECT');
      expect(preventSQLInjection('DROP TABLE users')).not.toContain('DROP');
      expect(preventSQLInjection('INSERT INTO table')).not.toContain('INSERT');
    });

    test('should remove SQL comment syntax', () => {
      expect(preventSQLInjection('test --')).not.toContain('--');
      expect(preventSQLInjection('test /* comment */')).not.toContain('/*');
    });

    test('should handle case insensitivity', () => {
      expect(preventSQLInjection('select * from users')).not.toContain('select');
      expect(preventSQLInjection('SeLeCt * from users')).not.toContain('SeLeCt');
    });
  });

  describe('preventScriptInjection', () => {
    test('should remove script tags', () => {
      const malicious = '<script>alert(1)</script>';
      expect(preventScriptInjection(malicious)).not.toContain('<script>');
    });

    test('should remove event handlers', () => {
      expect(preventScriptInjection('onclick="alert(1)"')).not.toContain('onclick');
      expect(preventScriptInjection('onerror="alert(1)"')).not.toContain('onerror');
    });

    test('should remove javascript: protocol', () => {
      expect(preventScriptInjection('javascript:alert(1)')).not.toContain('javascript:');
    });

    test('should remove data:text/html protocol', () => {
      expect(preventScriptInjection('data:text/html,<script>alert(1)</script>'))
        .not.toContain('data:text/html');
    });
  });

  describe('isValidEmail', () => {
    test('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test_123@example.com')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });

    test('should enforce max length (254 characters)', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should accept valid Portuguese phone numbers', () => {
      expect(isValidPhone('912345678')).toBe(true);
      expect(isValidPhone('+351912345678')).toBe(true);
      expect(isValidPhone('912 345 678')).toBe(true);
      expect(isValidPhone('(912) 345-678')).toBe(true);
    });

    test('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('012345678')).toBe(false); // Starts with 0
      expect(isValidPhone('abc123456')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
    });
  });

  describe('isValidURL', () => {
    test('should accept valid HTTP/HTTPS URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('https://example.com/path?query=value')).toBe(true);
    });

    test('should reject non-HTTP protocols', () => {
      expect(isValidURL('javascript:alert(1)')).toBe(false);
      expect(isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidURL('ftp://example.com')).toBe(false);
    });

    test('should handle invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    test('should apply default sanitization', () => {
      const input = '  <script>alert("xss")</script>Hello  ';
      const result = sanitizeString(input);

      expect(result).not.toContain('<script>');
    });

    test('should respect maxLength', () => {
      const input = 'a'.repeat(1000);
      const result = sanitizeString(input, { maxLength: 100 });

      expect(result.length).toBe(100);
    });

    test('should trim when trim option is true', () => {
      const result = sanitizeString('  test  ', { trim: true });
      expect(result).toBe('test');
    });

    test('should remove HTML when allowHTML is false', () => {
      const result = sanitizeString('<p>test</p>', { allowHTML: false });
      expect(result).not.toContain('<p>');
    });

    test('should preserve newlines when allowNewlines is true', () => {
      const result = sanitizeString('line1\nline2', { allowNewlines: true });
      expect(result).toContain('\n');
    });

    test('should remove newlines when allowNewlines is false', () => {
      const result = sanitizeString('line1\nline2', { allowNewlines: false });
      expect(result).not.toContain('\n');
    });
  });

  describe('sanitizeObject', () => {
    test('should sanitize all string values', () => {
      const input = {
        name: '<script>alert(1)</script>',
        email: 'test@example.com',
        age: 25,
      };

      const result = sanitizeObject(input);

      expect(result.name).not.toContain('<script>');
      expect(result.email).toBe('test@example.com');
      expect(result.age).toBe(25);
    });

    test('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>alert(1)</script>',
          profile: {
            bio: '<img src=x onerror="alert(1)">',
          },
        },
      };

      const result = sanitizeObject(input);

      expect(result.user.name).not.toContain('<script>');
      expect(result.user.profile.bio).not.toContain('onerror');
    });

    test('should sanitize arrays', () => {
      const input = {
        items: ['<script>alert(1)</script>', 'normal text'],
      };

      const result = sanitizeObject(input);

      expect(result.items[0]).not.toContain('<script>');
      expect(result.items[1]).toBe('normal text');
    });

    test('should sanitize object keys', () => {
      const input = {
        '<script>key</script>': 'value',
      };

      const result = sanitizeObject(input);
      const keys = Object.keys(result);

      expect(keys[0]).not.toContain('<script>');
    });
  });

  describe('validateInput', () => {
    test('should validate required fields', () => {
      const schema = {
        name: { required: true, type: 'string' },
      };

      const result1 = validateInput({ name: 'John' }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({}, schema);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain("Field 'name' is required");
    });

    test('should validate types', () => {
      const schema = {
        age: { required: true, type: 'number' },
      };

      const result1 = validateInput({ age: 25 }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({ age: '25' }, schema);
      expect(result2.valid).toBe(false);
    });

    test('should validate enum values', () => {
      const schema = {
        status: { required: true, type: 'string', enum: ['active', 'inactive'] },
      };

      const result1 = validateInput({ status: 'active' }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({ status: 'unknown' }, schema);
      expect(result2.valid).toBe(false);
    });

    test('should validate string length', () => {
      const schema = {
        name: { required: true, type: 'string', minLength: 2, maxLength: 10 },
      };

      const result1 = validateInput({ name: 'John' }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({ name: 'J' }, schema);
      expect(result2.valid).toBe(false);

      const result3 = validateInput({ name: 'VeryLongName' }, schema);
      expect(result3.valid).toBe(false);
    });

    test('should validate number range', () => {
      const schema = {
        age: { required: true, type: 'number', min: 0, max: 120 },
      };

      const result1 = validateInput({ age: 25 }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({ age: -5 }, schema);
      expect(result2.valid).toBe(false);

      const result3 = validateInput({ age: 150 }, schema);
      expect(result3.valid).toBe(false);
    });

    test('should use custom validators', () => {
      const schema = {
        email: {
          required: true,
          type: 'string',
          validator: isValidEmail,
        },
      };

      const result1 = validateInput({ email: 'test@example.com' }, schema);
      expect(result1.valid).toBe(true);

      const result2 = validateInput({ email: 'invalid' }, schema);
      expect(result2.valid).toBe(false);
    });
  });

  describe('Validation Schemas', () => {
    test('error schema should have correct structure', () => {
      expect(validationSchemas.error).toBeDefined();
      expect(validationSchemas.error.message).toBeDefined();
      expect(validationSchemas.error.message.required).toBe(true);
    });

    test('analytics schema should have correct structure', () => {
      expect(validationSchemas.analytics).toBeDefined();
      expect(validationSchemas.analytics.metrics).toBeDefined();
      expect(validationSchemas.analytics.metrics.type).toBe('array');
    });

    test('feedback schema should have correct structure', () => {
      expect(validationSchemas.feedback).toBeDefined();
      expect(validationSchemas.feedback.type).toBeDefined();
      expect(validationSchemas.feedback.type.enum).toContain('error_report');
    });
  });

  describe('Security Tests', () => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      "'; DROP TABLE users;--",
      '<img src=x onerror="alert(1)">',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)">',
    ];

    maliciousInputs.forEach((input, index) => {
      test(`should sanitize malicious input ${index + 1}`, () => {
        const sanitized = sanitizeString(input, { allowHTML: false });

        expect(sanitized.toLowerCase()).not.toContain('script');
        expect(sanitized).not.toContain('DROP');
        expect(sanitized.toLowerCase()).not.toContain('onerror');
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
      });
    });
  });
});
