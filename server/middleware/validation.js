/**
 * Input Validation and Sanitization Middleware
 * Protects against XSS, SQL Injection, and other attacks
 */

/**
 * HTML Entity Encoder
 * Prevents XSS by encoding HTML special characters
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

  return str.replace(/[&<>"'\/]/g, (char) => htmlEntities[char]);
}

/**
 * Strip HTML Tags
 * Removes all HTML tags from input
 */
export function stripHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}

/**
 * SQL Injection Prevention
 * Sanitizes input to prevent SQL injection (even though we use JSON storage)
 */
export function preventSQLInjection(str) {
  if (typeof str !== 'string') return str;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /('|(\\'))/g,
  ];

  let sanitized = str;
  sqlPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}

/**
 * Script Tag Prevention
 * Removes script tags and event handlers
 */
export function preventScriptInjection(str) {
  if (typeof str !== 'string') return str;

  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  str = str.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  str = str.replace(/data:text\/html/gi, '');

  return str;
}

/**
 * Path Traversal Prevention
 * Prevents directory traversal attacks
 */
export function preventPathTraversal(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\.\./g, '').replace(/[\/\\]/g, '');
}

/**
 * Email Validation
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Phone Number Validation (Portuguese format)
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Portuguese phone: +351 followed by 9 digits, or just 9 digits
  const phoneRegex = /^(\+351)?[1-9]\d{8}$/;
  return phoneRegex.test(cleaned);
}

/**
 * URL Validation
 */
export function isValidURL(url) {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    // Only allow HTTP and HTTPS
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize String Input
 * Comprehensive sanitization for text inputs
 */
export function sanitizeString(str, options = {}) {
  if (typeof str !== 'string') return str;

  const {
    maxLength = 10000,
    allowHTML = false,
    allowNewlines = true,
    trim = true,
  } = options;

  // Trim whitespace
  if (trim) {
    str = str.trim();
  }

  // Limit length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Remove HTML if not allowed
  if (!allowHTML) {
    str = stripHTML(str);
    str = preventScriptInjection(str);
    str = encodeHTML(str);
  }

  // Remove newlines if not allowed
  if (!allowNewlines) {
    str = str.replace(/[\r\n]/g, ' ');
  }

  // Prevent SQL injection patterns
  str = preventSQLInjection(str);

  return str;
}

/**
 * Sanitize Object (recursively sanitize all string values)
 */
export function sanitizeObject(obj, options = {}) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize the key
    const sanitizedKey = sanitizeString(key, {
      maxLength: 100,
      allowHTML: false,
      allowNewlines: false,
    });

    // Sanitize the value
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value, options);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value, options);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }

  return sanitized;
}

/**
 * Validation Schemas
 */
export const validationSchemas = {
  // Error logging validation
  error: {
    type: { required: false, type: 'string', maxLength: 50 },
    message: { required: true, type: 'string', maxLength: 5000 },
    severity: {
      required: false,
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
    },
    stack: { required: false, type: 'string', maxLength: 10000 },
    url: { required: false, type: 'string', maxLength: 2048, validator: isValidURL },
    userAgent: { required: false, type: 'string', maxLength: 500 },
    environment: { required: false, type: 'string', maxLength: 20 },
  },

  // Analytics validation
  analytics: {
    metrics: { required: true, type: 'array', maxLength: 100 },
  },

  metric: {
    type: { required: true, type: 'string', maxLength: 50 },
    metric: { required: true, type: 'string', maxLength: 100 },
    value: { required: true, type: 'number', min: 0, max: 1000000 },
    rating: {
      required: false,
      type: 'string',
      enum: ['good', 'needs-improvement', 'poor'],
    },
    url: { required: false, type: 'string', maxLength: 2048 },
  },

  // Feedback validation
  feedback: {
    type: {
      required: true,
      type: 'string',
      enum: ['error_report', 'satisfaction', 'accessibility', 'general'],
    },
    description: { required: true, type: 'string', maxLength: 5000 },
    email: { required: false, type: 'string', maxLength: 254, validator: isValidEmail },
    rating: { required: false, type: 'number', min: 1, max: 5 },
    errorType: {
      required: false,
      type: 'string',
      enum: ['ui', 'functional', 'performance', 'content'],
    },
    wcagLevel: { required: false, type: 'string', enum: ['A', 'AA', 'AAA'] },
    steps: { required: false, type: 'string', maxLength: 2000 },
    expected: { required: false, type: 'string', maxLength: 1000 },
    location: { required: false, type: 'string', maxLength: 500 },
  },
};

/**
 * Validate Input Against Schema
 */
export function validateInput(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    // Skip validation if field is not present and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type checking
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
        continue;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Field '${field}' exceeds maximum length of ${rules.maxLength}`);
      }
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Field '${field}' is below minimum length of ${rules.minLength}`);
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Field '${field}' must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Field '${field}' must be at most ${rules.max}`);
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Field '${field}' exceeds maximum array length of ${rules.maxLength}`);
      }
    }

    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      errors.push(`Field '${field}' failed custom validation`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Request Body Sanitization Middleware
 */
export function sanitizeRequestBody(options = {}) {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, options);
    }
    next();
  };
}

/**
 * Request Query Sanitization Middleware
 */
export function sanitizeRequestQuery(req, res, next) {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query, {
      maxLength: 500,
      allowHTML: false,
      allowNewlines: false,
    });
  }
  next();
}

/**
 * Validate Error Request
 */
export function validateErrorRequest(req, res, next) {
  const validation = validateInput(req.body, validationSchemas.error);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.errors,
    });
  }

  next();
}

/**
 * Validate Analytics Request
 */
export function validateAnalyticsRequest(req, res, next) {
  const validation = validateInput(req.body, validationSchemas.analytics);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.errors,
    });
  }

  // Validate each metric in the array
  if (Array.isArray(req.body.metrics)) {
    for (let i = 0; i < req.body.metrics.length; i++) {
      const metricValidation = validateInput(
        req.body.metrics[i],
        validationSchemas.metric
      );

      if (!metricValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `Validation failed for metric at index ${i}`,
          details: metricValidation.errors,
        });
      }
    }
  }

  next();
}

/**
 * Validate Feedback Request
 */
export function validateFeedbackRequest(req, res, next) {
  const validation = validateInput(req.body, validationSchemas.feedback);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.errors,
    });
  }

  next();
}

/**
 * File Upload Validation (for future use)
 */
export function validateFileUpload(options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  } = options;

  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];

    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
        });
      }

      // Check MIME type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `File type ${file.mimetype} is not allowed`,
        });
      }

      // Check extension
      const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({
          success: false,
          error: `File extension ${ext} is not allowed`,
        });
      }

      // Sanitize filename
      file.originalname = sanitizeString(file.originalname, {
        maxLength: 255,
        allowHTML: false,
        allowNewlines: false,
      });
    }

    next();
  };
}

/**
 * Request Size Limiter
 */
export function limitRequestSize(maxSize = '10mb') {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];

    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);

      if (sizeInBytes > maxSizeInBytes) {
        return res.status(413).json({
          success: false,
          error: `Request size exceeds maximum of ${maxSize}`,
        });
      }
    }

    next();
  };
}

function parseSize(size) {
  if (typeof size === 'number') return size;
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.match(/^(\d+)(b|kb|mb|gb)$/i);
  if (!match) return 0;
  return parseInt(match[1]) * units[match[2].toLowerCase()];
}

export default {
  encodeHTML,
  stripHTML,
  preventSQLInjection,
  preventScriptInjection,
  preventPathTraversal,
  sanitizeString,
  sanitizeObject,
  sanitizeRequestBody,
  sanitizeRequestQuery,
  validateInput,
  validateErrorRequest,
  validateAnalyticsRequest,
  validateFeedbackRequest,
  validateFileUpload,
  limitRequestSize,
  isValidEmail,
  isValidPhone,
  isValidURL,
  validationSchemas,
};
