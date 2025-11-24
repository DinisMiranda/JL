# Security Implementation Guide
## João Lobo Advogados Website Security

**Last Updated:** November 17, 2025
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Content Security Policy (CSP)](#content-security-policy-csp)
4. [Security Headers](#security-headers)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Rate Limiting](#rate-limiting)
7. [CSRF Protection](#csrf-protection)
8. [XSS Prevention](#xss-prevention)
9. [SQL Injection Prevention](#sql-injection-prevention)
10. [Form Security](#form-security)
11. [Configuration](#configuration)
12. [Best Practices](#best-practices)
13. [Security Testing](#security-testing)
14. [Incident Response](#incident-response)

---

## Overview

This document outlines the comprehensive security measures implemented in the João Lobo Advogados website. The security implementation follows industry best practices and OWASP Top 10 guidelines.

### Security Layers

```
┌─────────────────────────────────────┐
│  1. Content Security Policy (CSP)   │
├─────────────────────────────────────┤
│  2. Security Headers                │
├─────────────────────────────────────┤
│  3. CORS Configuration              │
├─────────────────────────────────────┤
│  4. Input Validation & Sanitization │
├─────────────────────────────────────┤
│  5. Rate Limiting                   │
├─────────────────────────────────────┤
│  6. CSRF Protection (optional)      │
├─────────────────────────────────────┤
│  7. Request Size Limiting           │
└─────────────────────────────────────┘
```

### Key Features

- ✅ **Content Security Policy** - Controls resource loading
- ✅ **Security Headers** - HSTS, X-Frame-Options, etc.
- ✅ **Input Sanitization** - XSS and injection prevention
- ✅ **Rate Limiting** - DDoS and brute force protection
- ✅ **CSRF Protection** - Cross-site request forgery prevention
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Request Validation** - Schema-based validation

---

## Security Architecture

### Backend Security Stack

**File Structure:**
```
server/
├── middleware/
│   ├── security.js      # CSP & security headers
│   ├── validation.js    # Input validation & sanitization
│   ├── rate-limit.js    # Rate limiting
│   └── csrf.js          # CSRF protection
└── index.js             # Main server with security integration
```

**Frontend Security:**
```
src/utils/
└── input-sanitizer.js   # Client-side input sanitization
```

### Security Flow

```
Client Request
      ↓
┌─────────────────┐
│ Security Headers│ ← Helmet, CSP, CORS
└─────────────────┘
      ↓
┌─────────────────┐
│ Rate Limiting   │ ← Global + endpoint specific
└─────────────────┘
      ↓
┌─────────────────┐
│ CSRF Validation │ ← Token verification (if enabled)
└─────────────────┘
      ↓
┌─────────────────┐
│ Input Sanitize  │ ← XSS, SQL injection prevention
└─────────────────┘
      ↓
┌─────────────────┐
│ Schema Validate │ ← Data structure validation
└─────────────────┘
      ↓
┌─────────────────┐
│ Business Logic  │
└─────────────────┘
```

---

## Content Security Policy (CSP)

### What is CSP?

Content Security Policy is a security layer that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

### Configuration

**Location:** `server/middleware/security.js`

**Production CSP:**
```javascript
{
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",  // Required for inline styles
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "https:",
      "https://www.google-analytics.com"
    ],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],  // Prevent clickjacking
    upgradeInsecureRequests: []
  }
}
```

### CSP Directives Explained

| Directive | Purpose | Configuration |
|-----------|---------|---------------|
| `default-src` | Default source for all fetch directives | `'self'` - Same origin only |
| `script-src` | Controls JavaScript sources | Self + GA + GTM |
| `style-src` | Controls CSS sources | Self + inline + Google Fonts |
| `img-src` | Controls image sources | Self + HTTPS + data URLs |
| `font-src` | Controls font sources | Self + Google Fonts |
| `frame-ancestors` | Controls embedding | `'none'` - Prevent clickjacking |
| `object-src` | Controls plugins | `'none'` - No plugins |

### CSP Violation Reporting

The system logs CSP violations for monitoring:

```javascript
// Violations are logged to console
console.warn('CSP Violation Report:', {
  timestamp: new Date().toISOString(),
  report: req.body,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Development vs Production

**Development Mode:**
- Relaxed CSP with `unsafe-inline` and `unsafe-eval`
- Report-only mode (doesn't block violations)
- Allows all sources for easier development

**Production Mode:**
- Strict CSP enforcement
- Only allows whitelisted sources
- Violations are logged and blocked

---

## Security Headers

### Implemented Headers

#### 1. HTTP Strict Transport Security (HSTS)

Forces HTTPS connections for enhanced security.

```javascript
hsts: {
  maxAge: 31536000,        // 1 year
  includeSubDomains: true,
  preload: true
}
```

**What it does:**
- Forces browsers to use HTTPS for 1 year
- Applies to all subdomains
- Eligible for browser HSTS preload lists

#### 2. X-Frame-Options

Prevents clickjacking attacks.

```javascript
frameguard: {
  action: 'deny'
}
```

**What it does:**
- Prevents the site from being embedded in iframes
- Protects against clickjacking attacks

#### 3. X-Content-Type-Options

Prevents MIME-sniffing vulnerabilities.

```javascript
noSniff: true
```

**What it does:**
- Forces browsers to respect Content-Type headers
- Prevents MIME confusion attacks

#### 4. Referrer-Policy

Controls referrer information sent with requests.

```javascript
referrerPolicy: {
  policy: 'strict-origin-when-cross-origin'
}
```

**What it does:**
- Sends full URL for same-origin requests
- Sends only origin for cross-origin HTTPS requests
- Sends nothing for HTTPS → HTTP requests

#### 5. Permissions-Policy

Controls browser features and APIs.

```javascript
'Permissions-Policy': [
  'geolocation=()',      // Disable geolocation
  'microphone=()',       // Disable microphone
  'camera=()',           // Disable camera
  'payment=()',          // Disable payment API
  'usb=()',             // Disable USB
  // ... more restrictions
].join(', ')
```

**What it does:**
- Disables unnecessary browser features
- Reduces attack surface
- Improves privacy

#### 6. Cross-Origin Policies

```javascript
'Cross-Origin-Embedder-Policy': 'require-corp'
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Resource-Policy': 'same-origin'
```

**What it does:**
- Isolates the site from cross-origin resources
- Protects against Spectre-like attacks
- Enables SharedArrayBuffer in secure contexts

### Verifying Headers

**Using curl:**
```bash
curl -I https://joaolobo.pt/api/health
```

**Expected output:**
```
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

---

## Input Validation & Sanitization

### Server-Side Validation

**Location:** `server/middleware/validation.js`

#### Sanitization Functions

**1. HTML Encoding:**
```javascript
function encodeHTML(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'\/]/g, char => htmlEntities[char]);
}
```

**2. Script Removal:**
```javascript
function preventScriptInjection(str) {
  // Remove script tags
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  str = str.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  str = str.replace(/javascript:/gi, '');

  return str;
}
```

**3. SQL Injection Prevention:**
```javascript
function preventSQLInjection(str) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /('|(\\'))/g
  ];

  let sanitized = str;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}
```

#### Validation Schemas

**Error Logging Schema:**
```javascript
error: {
  type: { required: false, type: 'string', maxLength: 50 },
  message: { required: true, type: 'string', maxLength: 5000 },
  severity: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical']
  },
  stack: { required: false, type: 'string', maxLength: 10000 },
  url: { required: false, type: 'string', maxLength: 2048, validator: isValidURL }
}
```

**Feedback Schema:**
```javascript
feedback: {
  type: {
    required: true,
    type: 'string',
    enum: ['error_report', 'satisfaction', 'accessibility', 'general']
  },
  description: { required: true, type: 'string', maxLength: 5000 },
  email: { required: false, type: 'string', maxLength: 254, validator: isValidEmail },
  rating: { required: false, type: 'number', min: 1, max: 5 }
}
```

#### Usage in Endpoints

```javascript
app.post('/api/errors',
  errorLoggingLimiter,
  validateErrorRequest,  // ← Schema validation
  async (req, res) => {
    // req.body is already validated and sanitized
  }
);
```

### Client-Side Sanitization

**Location:** `src/utils/input-sanitizer.js`

#### Form Sanitizer Class

```javascript
import { FormSanitizer } from './utils/input-sanitizer.js';

const form = document.querySelector('form');
const sanitizer = new FormSanitizer(form);

// Validate with custom rules
const result = sanitizer.validate({
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    email: true
  },
  phone: {
    required: false,
    phone: true
  }
});

if (result.valid) {
  // result.data contains sanitized values
  console.log(result.data);
} else {
  // result.errors contains validation errors
  sanitizer.showErrors();
}
```

#### Automatic Sanitization

```javascript
import { setupFormSanitization } from './utils/input-sanitizer.js';

// Initialize automatic sanitization for all forms
setupFormSanitization();
```

This automatically:
- Sanitizes text inputs on blur
- Validates email format
- Validates phone numbers
- Removes HTML tags
- Prevents script injection

---

## Rate Limiting

### Overview

Rate limiting protects against:
- Brute force attacks
- DDoS attacks
- API abuse
- Form spam
- Automated scraping

### Rate Limit Tiers

**Location:** `server/middleware/rate-limit.js`

#### 1. Global Rate Limiter

```javascript
windowMs: 15 * 60 * 1000  // 15 minutes
max: 100                   // 100 requests per window
```

**Applies to:** All `/api/*` endpoints
**Purpose:** General API protection

#### 2. Error Logging Rate Limiter

```javascript
windowMs: 5 * 60 * 1000   // 5 minutes
max: 50                    // 50 errors per window
```

**Applies to:** `POST /api/errors`
**Purpose:** Prevent error log spam

#### 3. Analytics Rate Limiter

```javascript
windowMs: 5 * 60 * 1000   // 5 minutes
max: 100                   // 100 batches per window
```

**Applies to:** `POST /api/analytics`
**Purpose:** Prevent analytics flooding

#### 4. Feedback Rate Limiter

```javascript
windowMs: 60 * 60 * 1000  // 1 hour
max: 5                     // 5 submissions per hour
```

**Applies to:** `POST /api/feedback`
**Purpose:** Prevent feedback spam

#### 5. Strict Rate Limiter

```javascript
windowMs: 15 * 60 * 1000  // 15 minutes
max: 5                     // Only 5 attempts
skipSuccessfulRequests: true
```

**Applies to:** Authentication, password reset (future)
**Purpose:** Brute force protection

### Rate Limit Headers

When rate limits are in effect, responses include:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1699999999
```

### Rate Limit Responses

**When limit is exceeded:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": "2025-11-17T11:00:00.000Z"
}
```

**HTTP Status:** `429 Too Many Requests`

### Advanced Rate Limiting

#### Sliding Window Rate Limiter

More accurate than fixed windows:

```javascript
import { SlidingWindowRateLimiter } from './middleware/rate-limit.js';

const slidingLimiter = new SlidingWindowRateLimiter({
  windowMs: 60000,
  maxRequests: 60
});

app.use('/api/premium', slidingLimiter.middleware());
```

#### Honeypot Rate Limiter

Automatically blocks IPs that hit honeypot endpoints:

```javascript
import { HoneypotRateLimiter } from './middleware/rate-limit.js';

const honeypot = new HoneypotRateLimiter();

// Apply to all routes
app.use(honeypot.middleware());

// Create honeypot endpoints
app.all('/wp-admin', honeypot.honeypotHandler());
app.all('/phpmyadmin', honeypot.honeypotHandler());
```

### Monitoring Rate Limits

```javascript
// Server logs when limits are exceeded
console.warn('Rate limit exceeded:', {
  ip: req.ip,
  path: req.path,
  timestamp: new Date().toISOString()
});
```

---

## CSRF Protection

### What is CSRF?

Cross-Site Request Forgery is an attack that forces authenticated users to submit unwanted requests.

### Implementation

**Location:** `server/middleware/csrf.js`

### Token-Based Protection

#### 1. Generate CSRF Token

```javascript
// Client requests a token
GET /api/csrf-token

// Response:
{
  "success": true,
  "csrfToken": "a1b2c3d4e5f6...",
  "expiresIn": 3600
}
```

#### 2. Include Token in Requests

```javascript
// Option 1: Header
fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  body: JSON.stringify(data)
});

// Option 2: Body parameter
fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...data,
    _csrf: token
  })
});
```

#### 3. Server Validates Token

```javascript
app.post('/api/feedback',
  validateCSRFToken,  // ← Validates token
  async (req, res) => {
    // Token is valid, proceed
  }
);
```

### Double Submit Cookie Pattern

Alternative CSRF protection method:

```javascript
import { doubleSubmitCookie } from './middleware/csrf.js';

const csrf = doubleSubmitCookie({
  cookieName: '_csrf',
  headerName: 'X-CSRF-Token',
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
});

app.use(csrf.setCookie);
app.use(csrf.validate);
```

### Origin Validation

Additional CSRF protection layer:

```javascript
import { validateOrigin } from './middleware/csrf.js';

app.use(validateOrigin([
  'https://joaolobo.pt',
  'https://www.joaolobo.pt',
  '*.joaolobo.pt'  // Wildcard subdomain
]));
```

### Configuration

**Enable CSRF in .env:**
```bash
ENABLE_CSRF_PROTECTION=true
```

### Token Characteristics

- **Length:** 64 characters (hex)
- **Expiry:** 1 hour
- **Single-use:** Tokens are invalidated after use
- **Session-bound:** Tokens tied to IP + User Agent

### CSRF Error Responses

```json
{
  "success": false,
  "error": "CSRF token missing",
  "code": "CSRF_TOKEN_MISSING"
}
```

```json
{
  "success": false,
  "error": "Invalid or expired CSRF token",
  "code": "CSRF_TOKEN_INVALID"
}
```

---

## XSS Prevention

### Multiple Layers of XSS Protection

#### 1. Content Security Policy

Primary XSS defense - prevents inline scripts:

```javascript
scriptSrc: ["'self'", "https://trusted-cdn.com"]
```

#### 2. Input Sanitization

**Server-side:**
```javascript
// Automatic sanitization of all inputs
app.use(sanitizeRequestBody({
  maxLength: 10000,
  allowHTML: false,
  allowNewlines: true
}));
```

**Client-side:**
```javascript
import { sanitizeInput } from './utils/input-sanitizer.js';

const userInput = sanitizeInput(value, {
  maxLength: 500,
  allowHTML: false,
  allowScripts: false
});
```

#### 3. HTML Encoding

```javascript
import { encodeHTML } from './utils/input-sanitizer.js';

// Before inserting into DOM
element.textContent = userInput;  // Automatic encoding

// Or manually
element.innerHTML = encodeHTML(userInput);
```

#### 4. DOM Manipulation Best Practices

**✅ Safe:**
```javascript
element.textContent = userInput;
element.setAttribute('data-value', encodeHTML(userInput));
```

**❌ Unsafe:**
```javascript
element.innerHTML = userInput;  // XSS vulnerability
```

### XSS Attack Vectors Prevented

| Attack Vector | Prevention Method |
|---------------|-------------------|
| `<script>alert('XSS')</script>` | CSP + Script tag removal |
| `<img src=x onerror="alert('XSS')">` | Event handler removal |
| `<a href="javascript:alert('XSS')">` | Protocol sanitization |
| `<iframe src="evil.com">` | CSP frame-src directive |
| `eval(userInput)` | CSP unsafe-eval restriction |
| `document.write(userInput)` | Input sanitization |

---

## SQL Injection Prevention

### Not Applicable (No SQL Database)

This application uses **JSON file storage** instead of SQL databases, which eliminates traditional SQL injection risks.

However, the validation middleware still includes SQL pattern detection for defense-in-depth:

```javascript
function preventSQLInjection(str) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\b)/gi,
    /(--|;|\/\*|\*\/)/g
  ];

  // Remove SQL-like patterns
  sqlPatterns.forEach(pattern => {
    str = str.replace(pattern, '');
  });

  return str;
}
```

### If Migrating to SQL Database

When migrating to PostgreSQL/MySQL, use:

1. **Parameterized Queries:**
```javascript
// ✅ Safe - parameterized
db.query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ Unsafe - concatenation
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

2. **ORM with Built-in Protection:**
```javascript
// Using Sequelize
User.findOne({ where: { email: email } });

// Using Prisma
prisma.user.findUnique({ where: { email: email } });
```

---

## Form Security

### Contact Form Security Features

#### 1. Client-Side Validation

```javascript
import { FormSanitizer } from './utils/input-sanitizer.js';

const contactForm = new FormSanitizer(document.querySelector('#contact-form'));

contactForm.validate({
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
    message: 'Nome deve conter apenas letras'
  },
  email: {
    required: true,
    email: true
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 5000
  }
});
```

#### 2. Real-time Sanitization

```javascript
import { attachSanitizer } from './utils/input-sanitizer.js';

// Attach to specific fields
attachSanitizer(document.querySelector('#name'), {
  type: 'letters',
  maxLength: 100
});

attachSanitizer(document.querySelector('#email'), {
  type: 'email',
  maxLength: 254
});

attachSanitizer(document.querySelector('#phone'), {
  type: 'phone',
  maxLength: 20
});
```

#### 3. Rate Limiting

Form submissions are rate limited:
- **5 submissions per hour** per IP/User Agent combination

#### 4. Honeypot Fields

Add invisible fields to catch bots:

```html
<input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
```

```javascript
// Server-side validation
if (req.body.website) {
  // Bot detected - silently reject
  return res.status(400).json({
    success: false,
    error: 'Invalid submission'
  });
}
```

#### 5. Session Limits

Feedback system limits:
- **3 feedback submissions per session**

```javascript
import { FeedbackStore } from './utils/feedback-system.js';

if (!feedbackStore.canSubmit()) {
  alert('Limite de envios atingido para esta sessão');
  return;
}
```

### reCAPTCHA Integration (Optional)

**Frontend:**
```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>

<div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
```

**Backend Verification:**
```javascript
async function verifyRecaptcha(token) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET,
      response: token
    })
  });

  const data = await response.json();
  return data.success;
}

app.post('/api/feedback', async (req, res) => {
  const isValid = await verifyRecaptcha(req.body.recaptchaToken);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'reCAPTCHA verification failed'
    });
  }

  // Process feedback
});
```

---

## Configuration

### Environment Variables

**Location:** `.env`

```bash
# Security Configuration
NODE_ENV=production
ENABLE_CSRF_PROTECTION=true

# CORS Origins
CORS_ORIGIN=https://joaolobo.pt,https://www.joaolobo.pt

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional - reCAPTCHA
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET=your_secret_key
```

### CSP Configuration

**Adjust for your needs:**

```javascript
// server/middleware/security.js

// Add trusted CDN
scriptSrc: [
  "'self'",
  'https://cdn.jsdelivr.net'
],

// Add trusted analytics
connectSrc: [
  "'self'",
  'https://analytics.example.com'
]
```

### Development vs Production

**Development:**
```bash
NODE_ENV=development
ENABLE_CSRF_PROTECTION=false
```
- Relaxed CSP
- Detailed error messages
- All origins allowed

**Production:**
```bash
NODE_ENV=production
ENABLE_CSRF_PROTECTION=true
```
- Strict CSP
- Generic error messages
- Specific origins only

---

## Best Practices

### 1. Keep Dependencies Updated

```bash
npm audit
npm update
npm outdated
```

### 2. Use HTTPS Everywhere

- Obtain SSL certificate (Let's Encrypt)
- Redirect HTTP → HTTPS
- Enable HSTS

### 3. Minimize Attack Surface

- Disable unused features
- Remove development endpoints in production
- Hide version information

### 4. Implement Logging

```javascript
// Log security events
console.warn('Security Event:', {
  type: 'RATE_LIMIT_EXCEEDED',
  ip: req.ip,
  path: req.path,
  timestamp: new Date().toISOString()
});
```

### 5. Regular Security Audits

- Review logs weekly
- Test security headers monthly
- Update dependencies monthly
- Penetration testing annually

### 6. Secure File Uploads (if implemented)

```javascript
import { validateFileUpload } from './middleware/validation.js';

app.post('/api/upload',
  validateFileUpload({
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['.jpg', '.png', '.pdf']
  }),
  async (req, res) => {
    // Process file
  }
);
```

### 7. Secure Cookie Configuration

```javascript
res.cookie('session', value, {
  httpOnly: true,      // Prevent XSS
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000      // 1 hour
});
```

### 8. Error Handling

```javascript
// ❌ Don't expose internal errors
res.status(500).json({
  error: err.message,
  stack: err.stack
});

// ✅ Generic error messages
res.status(500).json({
  success: false,
  error: 'Internal server error'
});
```

---

## Security Testing

### 1. Security Headers Test

**Online Tools:**
- [securityheaders.com](https://securityheaders.com)
- [observatory.mozilla.org](https://observatory.mozilla.org)

**Command line:**
```bash
curl -I https://joaolobo.pt | grep -E "(Strict-Transport|X-Frame|X-Content|CSP)"
```

### 2. CSP Testing

**Browser Console:**
```javascript
// Should be blocked by CSP
eval('alert("XSS")');
```

**CSP Evaluator:**
- [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com)

### 3. XSS Testing

**Test inputs:**
```javascript
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Click</a>
```

All should be sanitized and harmless.

### 4. Rate Limit Testing

```bash
# Test rate limiting
for i in {1..110}; do
  curl -X POST https://joaolobo.pt/api/errors \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}'
done
```

Should receive 429 after 100 requests.

### 5. CSRF Testing

```bash
# Without CSRF token
curl -X POST https://joaolobo.pt/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"type":"general","description":"test"}'

# Should fail with CSRF_TOKEN_MISSING
```

### 6. SQL Injection Testing

```bash
curl -X POST https://joaolobo.pt/api/errors \
  -H "Content-Type: application/json" \
  -d '{"message":"test'; DROP TABLE users;--"}'
```

SQL patterns should be stripped.

### 7. Input Validation Testing

```bash
# Oversized input
curl -X POST https://joaolobo.pt/api/feedback \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"$(python3 -c 'print("A"*10001)')\"}"

# Should fail with validation error
```

---

## Incident Response

### 1. Detecting Security Incidents

**Monitor for:**
- High rate of 429 responses
- CSP violation reports
- CSRF token failures
- Failed validation attempts
- Unusual error patterns

### 2. Response Procedures

**Step 1: Identify**
```bash
# Check logs
tail -f server.log | grep "WARN\|ERROR"

# Check rate limits
curl http://localhost:3001/api/dashboard
```

**Step 2: Contain**
```bash
# Block attacking IP (if using firewall)
sudo ufw deny from ATTACKING_IP

# Or add to honeypot blocker
honeypot.block(ATTACKING_IP);
```

**Step 3: Investigate**
```bash
# Analyze access patterns
grep "ATTACKING_IP" server.log | less

# Check for data exfiltration
grep "GET /api/errors\|GET /api/feedback" server.log
```

**Step 4: Recover**
- Clear compromised data
- Reset CSRF tokens
- Update security rules

**Step 5: Review**
- Document incident
- Update security measures
- Improve monitoring

### 3. Security Contacts

**Report security issues to:**
- Email: security@joaolobo.pt
- PGP Key: (if available)

---

## Compliance

### GDPR Compliance

The security implementation supports GDPR requirements:

- **Data Minimization:** Only necessary data collected
- **Access Control:** Admin-only access to stored data
- **Encryption:** HTTPS for data in transit
- **Right to Deletion:** DELETE endpoints available
- **Data Portability:** JSON export format

### WCAG Accessibility

Security features don't interfere with accessibility:
- Error messages are screen-reader friendly
- CAPTCHA alternatives available (honeypot fields)
- Rate limits allow assistive technology delays

---

## Additional Resources

### Security Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanner
- [Burp Suite](https://portswigger.net/burp) - Web vulnerability scanner
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency checker

### Training
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/) - Security training
- [HackTheBox](https://www.hackthebox.com/) - Penetration testing practice

---

## Changelog

### Version 1.0.0 (2025-11-17)

**Initial Release:**
- Implemented Content Security Policy
- Added comprehensive security headers
- Implemented input validation and sanitization
- Added multi-tier rate limiting
- Implemented CSRF protection (optional)
- Created frontend input sanitizer
- Documented all security features

---

**For questions or security concerns, please contact the development team.**
