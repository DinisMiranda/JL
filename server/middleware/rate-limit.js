/**
 * Enhanced Rate Limiting Middleware
 * Protects against brute force, DDoS, and abuse
 */

import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * Applies to all API endpoints
 */
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

/**
 * Strict Rate Limiter for Sensitive Endpoints
 * For login, registration, password reset, etc.
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 requests per window
  message: {
    success: false,
    error: 'Too many attempts, please try again later',
    retryAfter: '15 minutes',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    console.error('Strict rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
    });

    res.status(429).json({
      success: false,
      error: 'Too many attempts. Please try again later.',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
});

/**
 * Form Submission Rate Limiter
 * Protects contact forms and feedback submissions
 */
export const formSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour
  message: {
    success: false,
    error: 'Too many form submissions. Please try again later.',
    retryAfter: '1 hour',
  },
  keyGenerator: (req) => {
    // Use IP + user agent combination for more accurate tracking
    return `${req.ip}-${req.headers['user-agent']}`;
  },
  handler: (req, res) => {
    console.warn('Form submission limit exceeded:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
    });

    res.status(429).json({
      success: false,
      error: 'You have submitted too many forms. Please try again later.',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
});

/**
 * Feedback Specific Rate Limiter
 * More lenient for general feedback
 */
export const feedbackRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 feedback submissions per hour
  message: {
    success: false,
    error: 'Too many feedback submissions. Please try again in an hour.',
  },
  skipFailedRequests: true, // Count only successful submissions
});

/**
 * Error Logging Rate Limiter
 * Prevent error log spam
 */
export const errorLoggingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 errors per 5 minutes
  message: {
    success: false,
    error: 'Error logging limit exceeded',
  },
  handler: (req, res) => {
    // Still log but don't store
    console.warn('Error logging rate limit exceeded for IP:', req.ip);

    res.status(429).json({
      success: false,
      error: 'Error logging temporarily disabled. Please try again later.',
    });
  },
});

/**
 * Analytics Rate Limiter
 * More lenient for analytics
 */
export const analyticsRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 analytics batches per 5 minutes
  message: {
    success: false,
    error: 'Analytics rate limit exceeded',
  },
});

/**
 * IP-based Rate Limiter
 * Tracks by IP address only
 */
export function createIPRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP',
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    keyGenerator: (req) => req.ip,
  });
}

/**
 * Sliding Window Rate Limiter
 * More accurate rate limiting
 */
export class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 60;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Get existing requests for this IP
      let timestamps = this.requests.get(key) || [];

      // Remove old requests outside the window
      timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

      // Check if limit exceeded
      if (timestamps.length >= this.maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((timestamps[0] - windowStart) / 1000),
        });
      }

      // Add current request
      timestamps.push(now);
      this.requests.set(key, timestamps);

      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        this.cleanup();
      }

      next();
    };
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => t > windowStart);

      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }
}

/**
 * Honeypot Rate Limiter
 * Immediately blocks IPs that hit honeypot endpoints
 */
export class HoneypotRateLimiter {
  constructor() {
    this.blockedIPs = new Set();
    this.blockDuration = 24 * 60 * 60 * 1000; // 24 hours
    this.blocks = new Map();
  }

  block(ip) {
    this.blockedIPs.add(ip);
    this.blocks.set(ip, Date.now());

    console.error('IP blocked via honeypot:', ip);
  }

  isBlocked(ip) {
    if (!this.blockedIPs.has(ip)) return false;

    const blockTime = this.blocks.get(ip);
    if (Date.now() - blockTime > this.blockDuration) {
      this.blockedIPs.delete(ip);
      this.blocks.delete(ip);
      return false;
    }

    return true;
  }

  middleware() {
    return (req, res, next) => {
      if (this.isBlocked(req.ip)) {
        console.warn('Blocked IP attempted access:', req.ip);

        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      next();
    };
  }

  honeypotHandler() {
    return (req, res) => {
      this.block(req.ip);

      res.status(404).json({
        success: false,
        error: 'Not found',
      });
    };
  }
}

/**
 * Adaptive Rate Limiter
 * Adjusts limits based on server load
 */
export class AdaptiveRateLimiter {
  constructor(options = {}) {
    this.baseMax = options.baseMax || 100;
    this.windowMs = options.windowMs || 15 * 60 * 1000;
    this.requests = new Map();
  }

  getCurrentMax() {
    // Could adjust based on server metrics
    // For now, return base max
    return this.baseMax;
  }

  middleware() {
    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const currentMax = this.getCurrentMax();

      let timestamps = this.requests.get(key) || [];
      timestamps = timestamps.filter((t) => t > windowStart);

      if (timestamps.length >= currentMax) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
        });
      }

      timestamps.push(now);
      this.requests.set(key, timestamps);

      next();
    };
  }
}

/**
 * Distributed Rate Limiter Store (for future use with Redis)
 */
export class DistributedRateLimitStore {
  constructor(redisClient) {
    this.client = redisClient;
  }

  async increment(key) {
    const current = await this.client.incr(key);
    if (current === 1) {
      await this.client.expire(key, 900); // 15 minutes
    }
    return current;
  }

  async reset(key) {
    await this.client.del(key);
  }
}

/**
 * Rate Limit Info Middleware
 * Adds rate limit info to response headers
 */
export function rateLimitInfo(req, res, next) {
  res.setHeader('X-RateLimit-Policy', 'global=100/15m, forms=10/1h, strict=5/15m');
  next();
}

/**
 * Setup Rate Limiting for Application
 */
export function setupRateLimiting(app) {
  // Add rate limit info headers
  app.use(rateLimitInfo);

  // Apply global rate limiter
  app.use('/api', globalRateLimiter);

  console.log('✅ Rate limiting configured');
}

export default {
  globalRateLimiter,
  strictRateLimiter,
  formSubmissionLimiter,
  feedbackRateLimiter,
  errorLoggingLimiter,
  analyticsRateLimiter,
  createIPRateLimiter,
  SlidingWindowRateLimiter,
  HoneypotRateLimiter,
  AdaptiveRateLimiter,
  setupRateLimiting,
  rateLimitInfo,
};
