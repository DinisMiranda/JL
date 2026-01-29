/**
 * Frontend Input Sanitization Utilities
 * Protects against XSS and injection attacks on the client side
 */

/**
 * HTML Entity Encoder
 * Encodes special characters to prevent XSS
 */
export function encodeHTML(str) {
  if (typeof str !== 'string') return str;

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
}

/**
 * Decode HTML Entities
 */
export function decodeHTML(str) {
  if (typeof str !== 'string') return str;

  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || div.innerText || '';
}

/**
 * Strip HTML Tags
 * Removes all HTML tags from input (including script tags and their content)
 */
export function stripHTML(str) {
  if (typeof str !== 'string') return str;

  // Remove script tags and their content first
  let result = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove remaining HTML tags
  result = result.replace(/<[^>]*>/g, '');
  return result;
}

/**
 * Sanitize for HTML Attribute
 * Safely escape string for use in HTML attributes
 */
export function sanitizeAttribute(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize for JavaScript String
 * Escapes characters for safe use in JS strings
 */
export function sanitizeJS(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\//g, '\\/')
    .replace(/</g, '\\x3C')
    .replace(/>/g, '\\x3E');
}

/**
 * Remove Script Tags
 * Strips script tags and event handlers
 */
export function removeScripts(str) {
  if (typeof str !== 'string') return str;

  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, '');

  return str;
}

/**
 * Sanitize URL
 * Validates and sanitizes URLs
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') return '';

  // Remove whitespace
  url = url.trim();

  // Check for valid protocols
  const validProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

  try {
    const urlObj = new URL(url);

    if (!validProtocols.includes(urlObj.protocol)) {
      return '';
    }

    return urlObj.href;
  } catch {
    // If URL parsing fails, might be a relative URL
    // Only allow if it doesn't start with javascript: or data:
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return '';
    }

    return url;
  }
}

/**
 * Sanitize Email
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';

  email = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email) || email.length > 254) {
    return '';
  }

  return email;
}

/**
 * Sanitize Phone Number
 * Validates and formats phone numbers
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Portuguese phone validation
  const phoneRegex = /^(\+351)?[1-9]\d{8}$/;

  if (!phoneRegex.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize Input Field
 * General purpose input sanitization
 */
export function sanitizeInput(value, options = {}) {
  if (typeof value !== 'string') return value;

  const {
    maxLength = 10000,
    allowHTML = false,
    allowNewlines = true,
    trim = true,
    allowScripts = false,
  } = options;

  // Trim whitespace
  if (trim) {
    value = value.trim();
  }

  // Limit length
  if (value.length > maxLength) {
    value = value.substring(0, maxLength);
  }

  // Remove null bytes
  value = value.replace(/\0/g, '');

  // Remove scripts if not allowed
  if (!allowScripts) {
    value = removeScripts(value);
  }

  // Remove HTML if not allowed
  if (!allowHTML) {
    value = stripHTML(value);
  }

  // Remove newlines if not allowed
  if (!allowNewlines) {
    value = value.replace(/[\r\n]/g, ' ');
  }

  // Remove SQL injection patterns
  const sqlPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b/gi,
    /(--|;|\/\*|\*\/)/g,
  ];
  sqlPatterns.forEach((pattern) => {
    value = value.replace(pattern, '');
  });

  return value;
}

/**
 * Form Input Validator and Sanitizer
 */
export class FormSanitizer {
  constructor(formElement) {
    this.form = formElement;
    this.errors = new Map();
  }

  /**
   * Sanitize all form inputs
   */
  sanitizeAll() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    const sanitized = {};

    inputs.forEach((input) => {
      const { name, type, value } = input;

      if (!name) return;

      let sanitizedValue = value;

      switch (type) {
        case 'email':
          sanitizedValue = sanitizeEmail(value);
          break;

        case 'tel':
          sanitizedValue = sanitizePhone(value);
          break;

        case 'url':
          sanitizedValue = sanitizeURL(value);
          break;

        case 'number':
          sanitizedValue = parseFloat(value) || 0;
          break;

        case 'checkbox':
          sanitizedValue = input.checked;
          break;

        case 'radio':
          if (input.checked) {
            sanitizedValue = sanitizeInput(value, { maxLength: 200, allowHTML: false });
          }
          break;

        default:
          const isTextarea = input.tagName === 'TEXTAREA';
          sanitizedValue = sanitizeInput(value, {
            maxLength: isTextarea ? 5000 : 500,
            allowHTML: false,
            allowNewlines: isTextarea,
          });
      }

      sanitized[name] = sanitizedValue;
    });

    return sanitized;
  }

  /**
   * Validate form inputs
   */
  validate(rules = {}) {
    this.errors.clear();

    const data = this.sanitizeAll();

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];

      // Required validation
      if (fieldRules.required && (!value || value === '')) {
        this.errors.set(field, 'Este campo é obrigatório');
        continue;
      }

      // Skip further validation if empty and not required
      if (!value && !fieldRules.required) {
        continue;
      }

      // Min length validation
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        this.errors.set(field, `Deve ter pelo menos ${fieldRules.minLength} caracteres`);
      }

      // Max length validation
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        this.errors.set(field, `Não pode exceder ${fieldRules.maxLength} caracteres`);
      }

      // Email validation
      if (fieldRules.email && !sanitizeEmail(value)) {
        this.errors.set(field, 'Email inválido');
      }

      // Phone validation
      if (fieldRules.phone && !sanitizePhone(value)) {
        this.errors.set(field, 'Número de telefone inválido');
      }

      // URL validation
      if (fieldRules.url && !sanitizeURL(value)) {
        this.errors.set(field, 'URL inválida');
      }

      // Pattern validation
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        this.errors.set(field, fieldRules.message || 'Formato inválido');
      }

      // Custom validation
      if (fieldRules.custom && !fieldRules.custom(value)) {
        this.errors.set(field, fieldRules.message || 'Validação falhou');
      }
    }

    return {
      valid: this.errors.size === 0,
      errors: Object.fromEntries(this.errors),
      data,
    };
  }

  /**
   * Show validation errors
   */
  showErrors() {
    // Clear previous errors
    this.form.querySelectorAll('.error-message').forEach((el) => el.remove());
    this.form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));

    // Show new errors
    for (const [field, message] of this.errors) {
      const input = this.form.querySelector(`[name="${field}"]`);
      if (!input) continue;

      // Add error class
      input.classList.add('error');

      // Create error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.color = '#dc2626';
      errorDiv.style.fontSize = '0.875rem';
      errorDiv.style.marginTop = '0.25rem';

      // Insert after input
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors.clear();
    this.form.querySelectorAll('.error-message').forEach((el) => el.remove());
    this.form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
  }
}

/**
 * Real-time Input Sanitization
 * Attach to input fields for live sanitization
 */
export function attachSanitizer(input, options = {}) {
  const { type = 'text', maxLength = 500 } = options;

  input.addEventListener('input', (e) => {
    let value = e.target.value;

    switch (type) {
      case 'email':
        value = value.toLowerCase().trim();
        break;

      case 'phone':
        // Allow only numbers, spaces, +, -, (, )
        value = value.replace(/[^\d\s+\-()]/g, '');
        break;

      case 'alphanumeric':
        value = value.replace(/[^a-zA-Z0-9\s]/g, '');
        break;

      case 'letters':
        value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        break;

      case 'numbers':
        value = value.replace(/[^\d]/g, '');
        break;

      case 'no-html':
        value = stripHTML(value);
        break;
    }

    // Apply max length
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    }

    // Update input value
    if (e.target.value !== value) {
      e.target.value = value;
    }
  });

  // Sanitize on blur
  input.addEventListener('blur', (e) => {
    e.target.value = sanitizeInput(e.target.value, {
      maxLength,
      allowHTML: false,
      allowScripts: false,
    });
  });
}

/**
 * Setup automatic sanitization for all forms
 */
export function setupFormSanitization() {
  // Sanitize all text inputs on blur
  document.addEventListener(
    'blur',
    (e) => {
      if (
        e.target.matches('input[type="text"], input[type="search"], textarea') &&
        !e.target.dataset.noSanitize
      ) {
        e.target.value = sanitizeInput(e.target.value, {
          maxLength: parseInt(e.target.maxLength) || 5000,
          allowHTML: false,
        });
      }
    },
    true
  );

  // Sanitize email inputs
  document.addEventListener(
    'blur',
    (e) => {
      if (e.target.matches('input[type="email"]') && !e.target.dataset.noSanitize) {
        const sanitized = sanitizeEmail(e.target.value);
        if (sanitized !== e.target.value) {
          e.target.value = sanitized;
        }
      }
    },
    true
  );

  // Sanitize tel inputs
  document.addEventListener(
    'blur',
    (e) => {
      if (e.target.matches('input[type="tel"]') && !e.target.dataset.noSanitize) {
        const sanitized = sanitizePhone(e.target.value);
        if (sanitized !== e.target.value) {
          e.target.value = sanitized;
        }
      }
    },
    true
  );

  console.log('✅ Form sanitization initialized');
}

/**
 * Content Security Policy Helper
 * Check if inline scripts/styles are allowed
 */
export function isCSPCompliant(content, type = 'script') {
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

  if (!meta) {
    return true; // No CSP defined
  }

  const csp = meta.getAttribute('content');

  if (type === 'script') {
    // Check if unsafe-inline is allowed for scripts
    return csp.includes("script-src") && csp.includes("'unsafe-inline'");
  }

  if (type === 'style') {
    // Check if unsafe-inline is allowed for styles
    return csp.includes("style-src") && csp.includes("'unsafe-inline'");
  }

  return false;
}

export default {
  encodeHTML,
  decodeHTML,
  stripHTML,
  sanitizeAttribute,
  sanitizeJS,
  removeScripts,
  sanitizeURL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeInput,
  FormSanitizer,
  attachSanitizer,
  setupFormSanitization,
  isCSPCompliant,
};
