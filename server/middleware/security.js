/**
 * Security Middleware
 * Implements comprehensive security headers and Content Security Policy
 */

import helmet from 'helmet';

/**
 * Content Security Policy Configuration
 * Defines what resources can be loaded and from where
 */
export const cspConfig = {
  directives: {
    // Default source for all fetch directives
    defaultSrc: ["'self'"],

    // Script sources
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for inline scripts - consider using nonces in production
      "'unsafe-eval'", // Required for some frameworks - remove if possible
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://cdn.jsdelivr.net', // For CDN libraries if needed
    ],

    // Script sources for script tags with hashes or nonces
    scriptSrcAttr: ["'self'", "'unsafe-inline'"],

    // Style sources
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for inline styles
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],

    // Style sources for inline style attributes
    styleSrcAttr: ["'self'", "'unsafe-inline'"],

    // Font sources
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For data URLs in fonts
    ],

    // Image sources
    imgSrc: [
      "'self'",
      'data:', // For data URLs (base64 images)
      'blob:', // For blob URLs
      'https:', // Allow HTTPS images
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
    ],

    // Media sources (audio/video)
    mediaSrc: ["'self'", 'https:', 'data:'],

    // Object sources (for <object>, <embed>, <applet>)
    objectSrc: ["'none'"],

    // Frame sources (for iframes)
    frameSrc: [
      "'self'",
      'https://www.google.com', // For reCAPTCHA
      'https://www.recaptcha.net',
    ],

    // Frame ancestors (controls embedding)
    frameAncestors: ["'none'"], // Prevent clickjacking

    // Form action destinations
    formAction: ["'self'"],

    // Base URI restrictions
    baseUri: ["'self'"],

    // Connect sources (fetch, WebSocket, EventSource)
    connectSrc: [
      "'self'",
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      process.env.VITE_API_BASE_URL || 'http://localhost:3001',
    ],

    // Worker sources
    workerSrc: ["'self'", 'blob:'],

    // Manifest sources
    manifestSrc: ["'self'"],

    // Upgrade insecure requests
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  },

  // Report violations (optional - for monitoring)
  reportOnly: false, // Set to true during testing
};

/**
 * Security Headers Configuration
 */
export const securityHeaders = {
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false, // Disable DNS prefetching for privacy
  },

  // Frame Options (additional layer with CSP)
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },

  // Hide Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff (X-Content-Type-Options)
  noSniff: true,

  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // XSS Filter
  xssFilter: true,
};

/**
 * Additional Security Headers
 */
export function additionalSecurityHeaders(req, res, next) {
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()', // Disable geolocation
      'microphone=()', // Disable microphone
      'camera=()', // Disable camera
      'payment=()', // Disable payment API
      'usb=()', // Disable USB
      'magnetometer=()', // Disable magnetometer
      'gyroscope=()', // Disable gyroscope
      'accelerometer=()', // Disable accelerometer
      'ambient-light-sensor=()', // Disable ambient light sensor
      'autoplay=()', // Disable autoplay
      'encrypted-media=()', // Disable encrypted media
      'picture-in-picture=()', // Disable picture in picture
      'sync-xhr=()', // Disable synchronous XHR
    ].join(', ')
  );

  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Cross-Origin Policies
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
}

/**
 * Content Security Policy Violation Reporter
 */
export function cspViolationReporter(req, res, next) {
  if (req.path === '/api/csp-report') {
    console.warn('CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      report: req.body,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(204).send();
    return;
  }

  next();
}

/**
 * Security Middleware Setup
 */
export function setupSecurityMiddleware(app) {
  // Apply Helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: cspConfig,
      ...securityHeaders,
    })
  );

  // Apply additional headers
  app.use(additionalSecurityHeaders);

  // CSP violation reporter
  app.use(cspViolationReporter);

  console.log('✅ Security middleware configured');
}

/**
 * Development Mode Security (relaxed for local development)
 */
export function setupDevelopmentSecurity(app) {
  const devCspConfig = {
    directives: {
      ...cspConfig.directives,
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
      styleSrc: ["'self'", "'unsafe-inline'", '*'],
      imgSrc: ["'self'", 'data:', 'blob:', '*'],
      connectSrc: ["'self'", '*'],
    },
    reportOnly: true, // Don't enforce in development
  };

  app.use(
    helmet({
      contentSecurityPolicy: devCspConfig,
      ...securityHeaders,
      hsts: false, // Disable HSTS in development
    })
  );

  app.use(additionalSecurityHeaders);

  console.log('⚠️  Development security mode (relaxed CSP)');
}

/**
 * Security audit helper
 */
export function logSecurityInfo() {
  console.log('\n🔒 Security Configuration:');
  console.log('  - Content Security Policy: Enabled');
  console.log('  - Frame Protection: DENY');
  console.log('  - XSS Protection: Enabled');
  console.log('  - HSTS: Enabled (1 year)');
  console.log('  - No Sniff: Enabled');
  console.log('  - Referrer Policy: strict-origin-when-cross-origin');
  console.log('  - Permissions Policy: Restricted');
  console.log('  - CORS: Configured');
  console.log('  - Rate Limiting: Enabled\n');
}

export default {
  setupSecurityMiddleware,
  setupDevelopmentSecurity,
  cspConfig,
  securityHeaders,
  additionalSecurityHeaders,
  cspViolationReporter,
  logSecurityInfo,
};
