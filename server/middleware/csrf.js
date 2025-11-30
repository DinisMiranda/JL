/**
 * CSRF (Cross-Site Request Forgery) Protection Middleware
 * Generates and validates CSRF tokens for form submissions
 */

import crypto from 'crypto';

/**
 * CSRF Token Store
 * In production, use Redis or a database
 */
class CSRFTokenStore {
  constructor() {
    this.tokens = new Map();
    this.maxAge = 60 * 60 * 1000; // 1 hour
    this.cleanup();
  }

  generate(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.maxAge;

    this.tokens.set(token, {
      sessionId,
      expiry,
      used: false,
    });

    return token;
  }

  validate(token, sessionId) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      return false;
    }

    // Check if expired
    if (Date.now() > tokenData.expiry) {
      this.tokens.delete(token);
      return false;
    }

    // Check if already used (single-use tokens)
    if (tokenData.used) {
      return false;
    }

    // Check if session matches
    if (tokenData.sessionId !== sessionId) {
      return false;
    }

    // Mark as used
    tokenData.used = true;

    return true;
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [token, data] of this.tokens.entries()) {
        if (now > data.expiry) {
          this.tokens.delete(token);
        }
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  clear(sessionId) {
    for (const [token, data] of this.tokens.entries()) {
      if (data.sessionId === sessionId) {
        this.tokens.delete(token);
      }
    }
  }
}

// Global token store
const tokenStore = new CSRFTokenStore();

/**
 * Generate Session ID from Request
 * Uses IP + User Agent for stateless sessions
 */
function getSessionId(req) {
  const identifier = `${req.ip}-${req.headers['user-agent']}`;
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

/**
 * CSRF Token Generation Middleware
 */
export function generateCSRFToken(req, res, next) {
  const sessionId = getSessionId(req);
  const token = tokenStore.generate(sessionId);

  // Attach token to request
  req.csrfToken = token;

  // Add token to response for client to use
  res.locals.csrfToken = token;

  next();
}

/**
 * CSRF Token Validation Middleware
 */
export function validateCSRFToken(req, res, next) {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  // Validate token
  const sessionId = getSessionId(req);
  const isValid = tokenStore.validate(token, sessionId);

  if (!isValid) {
    console.warn('Invalid CSRF token:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    return res.status(403).json({
      success: false,
      error: 'Invalid or expired CSRF token',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  next();
}

/**
 * CSRF Token Endpoint
 * GET /api/csrf-token - Returns a new CSRF token
 */
export function csrfTokenEndpoint(req, res) {
  const sessionId = getSessionId(req);
  const token = tokenStore.generate(sessionId);

  res.json({
    success: true,
    csrfToken: token,
    expiresIn: 3600, // 1 hour in seconds
  });
}

/**
 * Double Submit Cookie Pattern
 * Alternative CSRF protection method
 */
export function doubleSubmitCookie(options = {}) {
  const {
    cookieName = '_csrf',
    headerName = 'X-CSRF-Token',
    cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  } = options;

  return {
    // Set CSRF cookie
    setCookie: (req, res, next) => {
      if (!req.cookies[cookieName]) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie(cookieName, token, cookieOptions);
        req.csrfToken = token;
      } else {
        req.csrfToken = req.cookies[cookieName];
      }
      next();
    },

    // Validate CSRF token
    validate: (req, res, next) => {
      // Skip for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const cookieToken = req.cookies[cookieName];
      const headerToken = req.headers[headerName.toLowerCase()];

      if (!cookieToken || !headerToken) {
        return res.status(403).json({
          success: false,
          error: 'CSRF protection failed',
          code: 'CSRF_TOKEN_MISSING',
        });
      }

      // Constant-time comparison to prevent timing attacks
      if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
        return res.status(403).json({
          success: false,
          error: 'CSRF protection failed',
          code: 'CSRF_TOKEN_MISMATCH',
        });
      }

      next();
    },
  };
}

/**
 * Origin Validation
 * Additional layer of CSRF protection
 */
export function validateOrigin(allowedOrigins = []) {
  return (req, res, next) => {
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const origin = req.headers.origin || req.headers.referer;

    if (!origin) {
      // No origin header - might be a same-origin request
      // or a request from a tool like curl
      return next();
    }

    // Parse origin URL
    let originURL;
    try {
      originURL = new URL(origin);
    } catch {
      return res.status(403).json({
        success: false,
        error: 'Invalid origin',
      });
    }

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed === '*') return true;
      if (allowed === originURL.origin) return true;

      // Support wildcard subdomains
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return originURL.hostname.endsWith(domain);
      }

      return false;
    });

    if (!isAllowed) {
      console.warn('Origin validation failed:', {
        origin: originURL.origin,
        ip: req.ip,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Origin not allowed',
      });
    }

    next();
  };
}

/**
 * Referer Validation
 * Validates the HTTP Referer header
 */
export function validateReferer(allowedReferers = []) {
  return (req, res, next) => {
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const referer = req.headers.referer || req.headers.referrer;

    if (!referer) {
      // No referer - might be legitimate
      return next();
    }

    const isAllowed = allowedReferers.some((allowed) => {
      return referer.startsWith(allowed);
    });

    if (!isAllowed) {
      console.warn('Referer validation failed:', {
        referer,
        ip: req.ip,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Invalid referer',
      });
    }

    next();
  };
}

/**
 * SameSite Cookie Helper
 * Ensures cookies are properly configured
 */
export function configureSameSiteCookies(app) {
  app.use((req, res, next) => {
    const originalSetCookie = res.cookie.bind(res);

    res.cookie = (name, value, options = {}) => {
      const cookieOptions = {
        ...options,
        sameSite: options.sameSite || 'strict',
        secure: options.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production',
        httpOnly: options.httpOnly !== undefined ? options.httpOnly : true,
      };

      return originalSetCookie(name, value, cookieOptions);
    };

    next();
  });
}

/**
 * CSRF Protection Setup
 */
export function setupCSRFProtection(app, options = {}) {
  const {
    enabled = true,
    excludePaths = ['/api/health', '/api/csrf-token'],
    allowedOrigins = [],
  } = options;

  if (!enabled) {
    console.log('⚠️  CSRF protection disabled');
    return;
  }

  // Configure SameSite cookies
  configureSameSiteCookies(app);

  // Add CSRF token endpoint
  app.get('/api/csrf-token', csrfTokenEndpoint);

  // Origin validation for all POST requests
  if (allowedOrigins.length > 0) {
    app.use(validateOrigin(allowedOrigins));
  }

  // CSRF token validation for state-changing requests
  app.use((req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Skip safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Validate CSRF token
    validateCSRFToken(req, res, next);
  });

  console.log('✅ CSRF protection configured');
}

/**
 * Custom Token Generator
 * For specific use cases
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Constant-time String Comparison
 * Prevents timing attacks
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export default {
  generateCSRFToken,
  validateCSRFToken,
  csrfTokenEndpoint,
  doubleSubmitCookie,
  validateOrigin,
  validateReferer,
  configureSameSiteCookies,
  setupCSRFProtection,
  generateToken,
  safeCompare,
  tokenStore,
};
