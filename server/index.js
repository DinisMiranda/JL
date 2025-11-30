/**
 * Backend Server for João Lobo Advogados
 * Handles error logging, analytics, and user feedback
 * With comprehensive security features
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Load environment variables
dotenv.config();

// Security middleware
import { setupSecurityMiddleware, setupDevelopmentSecurity, logSecurityInfo } from './middleware/security.js';
import {
  sanitizeRequestBody,
  sanitizeRequestQuery,
  validateErrorRequest,
  validateAnalyticsRequest,
  validateFeedbackRequest,
} from './middleware/validation.js';
import {
  globalRateLimiter,
  errorLoggingLimiter,
  analyticsRateLimiter,
  feedbackRateLimiter,
} from './middleware/rate-limit.js';
import { setupCSRFProtection } from './middleware/csrf.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Create data directory if it doesn't exist
const DATA_DIR = join(__dirname, 'data');
await fs.mkdir(DATA_DIR, { recursive: true });

// ====================
// SECURITY MIDDLEWARE
// ====================

// 1. Security Headers & CSP
if (isProduction) {
  setupSecurityMiddleware(app);
} else {
  setupDevelopmentSecurity(app);
}

// 2. CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
}));

// 3. Body Parsing with size limits
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Additional verification if needed
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Input Sanitization
app.use(sanitizeRequestBody({
  maxLength: 10000,
  allowHTML: false,
  allowNewlines: true,
}));
app.use(sanitizeRequestQuery);

// 5. CSRF Protection (optional - can be enabled in production)
if (process.env.ENABLE_CSRF_PROTECTION === 'true') {
  setupCSRFProtection(app, {
    enabled: true,
    excludePaths: ['/api/health', '/api/csrf-token'],
    allowedOrigins: corsOrigins,
  });
}

// 6. Global Rate Limiting
app.use('/api/', globalRateLimiter);

// 7. Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Data storage utilities
 */
class DataStore {
  constructor(filename) {
    this.filepath = join(DATA_DIR, filename);
    this.cache = null;
  }

  async read() {
    try {
      if (this.cache) return this.cache;

      const data = await fs.readFile(this.filepath, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async write(data) {
    this.cache = data;
    await fs.writeFile(this.filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async append(entry) {
    const data = await this.read();
    data.push({
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    });

    // Keep only last 1000 entries to prevent file from growing too large
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }

    await this.write(data);
    return data[data.length - 1];
  }

  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getStats() {
    const data = await this.read();
    return {
      total: data.length,
      today: data.filter(e => {
        const entryDate = new Date(e.timestamp);
        const today = new Date();
        return entryDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: data.filter(e => {
        const entryDate = new Date(e.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length
    };
  }
}

// Initialize data stores
const errorsStore = new DataStore('errors.json');
const analyticsStore = new DataStore('analytics.json');
const feedbackStore = new DataStore('feedback.json');

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Error logging endpoint
 * POST /api/errors
 */
app.post('/api/errors', errorLoggingLimiter, validateErrorRequest, async (req, res) => {
  try {
    const error = {
      type: req.body.type || 'unknown',
      message: req.body.message || 'No message provided',
      severity: req.body.severity || 'medium',
      stack: req.body.stack,
      userAgent: req.body.userAgent || req.headers['user-agent'],
      url: req.body.url,
      environment: req.body.environment || 'production',
      ip: req.ip,
      ...req.body
    };

    // Validate required fields
    if (!error.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: message'
      });
    }

    // Store error
    const savedError = await errorsStore.append(error);

    // Log critical errors
    if (error.severity === 'critical' || error.severity === 'high') {
      console.error('🚨 HIGH SEVERITY ERROR:', error.message);
      console.error('Details:', error);
    }

    res.status(201).json({
      success: true,
      id: savedError.id,
      timestamp: savedError.timestamp
    });

  } catch (error) {
    console.error('Failed to log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save error log'
    });
  }
});

/**
 * Get errors endpoint (for admin/debugging)
 * GET /api/errors
 */
app.get('/api/errors', async (req, res) => {
  try {
    const { limit = 50, severity, type } = req.query;
    let errors = await errorsStore.read();

    // Filter by severity
    if (severity) {
      errors = errors.filter(e => e.severity === severity);
    }

    // Filter by type
    if (type) {
      errors = errors.filter(e => e.type === type);
    }

    // Sort by timestamp (newest first)
    errors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    errors = errors.slice(0, parseInt(limit));

    const stats = await errorsStore.getStats();

    res.json({
      success: true,
      errors,
      stats,
      count: errors.length
    });

  } catch (error) {
    console.error('Failed to retrieve errors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve errors'
    });
  }
});

/**
 * Analytics endpoint
 * POST /api/analytics
 */
app.post('/api/analytics', analyticsRateLimiter, validateAnalyticsRequest, async (req, res) => {
  try {
    const { metrics } = req.body;

    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid metrics format. Expected array.'
      });
    }

    // Process and store each metric
    const savedMetrics = [];
    for (const metric of metrics) {
      const enhancedMetric = {
        ...metric,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      };

      const saved = await analyticsStore.append(enhancedMetric);
      savedMetrics.push(saved);
    }

    res.status(201).json({
      success: true,
      count: savedMetrics.length,
      ids: savedMetrics.map(m => m.id)
    });

  } catch (error) {
    console.error('Failed to save analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save analytics'
    });
  }
});

/**
 * Get analytics endpoint (for reporting)
 * GET /api/analytics
 */
app.get('/api/analytics', async (req, res) => {
  try {
    const { limit = 100, type, metric } = req.query;
    let analytics = await analyticsStore.read();

    // Filter by type
    if (type) {
      analytics = analytics.filter(a => a.type === type);
    }

    // Filter by metric (for web-vitals)
    if (metric) {
      analytics = analytics.filter(a => a.metric === metric);
    }

    // Sort by timestamp (newest first)
    analytics.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    analytics = analytics.slice(0, parseInt(limit));

    const stats = await analyticsStore.getStats();

    res.json({
      success: true,
      analytics,
      stats,
      count: analytics.length
    });

  } catch (error) {
    console.error('Failed to retrieve analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
});

/**
 * Analytics summary endpoint
 * GET /api/analytics/summary
 */
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const analytics = await analyticsStore.read();

    // Calculate Core Web Vitals averages
    const webVitals = analytics.filter(a => a.type === 'web-vital');

    const lcpValues = webVitals.filter(v => v.metric === 'LCP').map(v => v.value);
    const fidValues = webVitals.filter(v => v.metric === 'FID').map(v => v.value);
    const clsValues = webVitals.filter(v => v.metric === 'CLS').map(v => v.value);

    const average = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const summary = {
      webVitals: {
        lcp: {
          average: average(lcpValues).toFixed(2),
          count: lcpValues.length,
          good: lcpValues.filter(v => v <= 2500).length,
          needsImprovement: lcpValues.filter(v => v > 2500 && v <= 4000).length,
          poor: lcpValues.filter(v => v > 4000).length
        },
        fid: {
          average: average(fidValues).toFixed(2),
          count: fidValues.length,
          good: fidValues.filter(v => v <= 100).length,
          needsImprovement: fidValues.filter(v => v > 100 && v <= 300).length,
          poor: fidValues.filter(v => v > 300).length
        },
        cls: {
          average: average(clsValues).toFixed(3),
          count: clsValues.length,
          good: clsValues.filter(v => v <= 0.1).length,
          needsImprovement: clsValues.filter(v => v > 0.1 && v <= 0.25).length,
          poor: clsValues.filter(v => v > 0.25).length
        }
      },
      pageviews: analytics.filter(a => a.type === 'pageview').length,
      events: analytics.filter(a => a.type === 'event').length,
      totalMetrics: analytics.length
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Failed to generate analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary'
    });
  }
});

/**
 * Feedback endpoint
 * POST /api/feedback
 */
app.post('/api/feedback', feedbackRateLimiter, validateFeedbackRequest, async (req, res) => {
  try {
    const feedback = {
      type: req.body.type || 'general',
      description: req.body.description,
      email: req.body.email,
      context: req.body.context,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      ...req.body
    };

    // Validate based on feedback type
    if (feedback.type === 'error_report' && !feedback.description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required for error reports'
      });
    }

    if (feedback.type === 'satisfaction' && feedback.rating === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Rating is required for satisfaction feedback'
      });
    }

    // Store feedback
    const savedFeedback = await feedbackStore.append(feedback);

    // Log important feedback
    if (feedback.type === 'error_report' || feedback.type === 'accessibility') {
      console.log('📝 NEW FEEDBACK:', feedback.type);
      console.log('Description:', feedback.description);
      if (feedback.email) {
        console.log('Contact:', feedback.email);
      }
    }

    // Send email notification (implement if needed)
    // await sendFeedbackEmail(feedback);

    res.status(201).json({
      success: true,
      id: savedFeedback.id,
      timestamp: savedFeedback.timestamp
    });

  } catch (error) {
    console.error('Failed to save feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save feedback'
    });
  }
});

/**
 * Get feedback endpoint (for admin)
 * GET /api/feedback
 */
app.get('/api/feedback', async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    let feedback = await feedbackStore.read();

    // Filter by type
    if (type) {
      feedback = feedback.filter(f => f.type === type);
    }

    // Sort by timestamp (newest first)
    feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    feedback = feedback.slice(0, parseInt(limit));

    const stats = await feedbackStore.getStats();

    // Calculate satisfaction average
    const satisfactionFeedback = await feedbackStore.read();
    const ratings = satisfactionFeedback
      .filter(f => f.type === 'satisfaction' && f.rating)
      .map(f => f.rating);

    const averageRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
      : null;

    res.json({
      success: true,
      feedback,
      stats: {
        ...stats,
        averageRating,
        totalRatings: ratings.length
      },
      count: feedback.length
    });

  } catch (error) {
    console.error('Failed to retrieve feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback'
    });
  }
});

/**
 * Dashboard endpoint (summary of all data)
 * GET /api/dashboard
 */
app.get('/api/dashboard', async (req, res) => {
  try {
    const [errorsStats, analyticsStats, feedbackStats] = await Promise.all([
      errorsStore.getStats(),
      analyticsStore.getStats(),
      feedbackStore.getStats()
    ]);

    // Get recent errors by severity
    const errors = await errorsStore.read();
    const errorsBySeverity = {
      critical: errors.filter(e => e.severity === 'critical').length,
      high: errors.filter(e => e.severity === 'high').length,
      medium: errors.filter(e => e.severity === 'medium').length,
      low: errors.filter(e => e.severity === 'low').length
    };

    // Get satisfaction ratings
    const feedback = await feedbackStore.read();
    const ratings = feedback
      .filter(f => f.type === 'satisfaction' && f.rating)
      .map(f => f.rating);

    const averageRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
      : null;

    res.json({
      success: true,
      dashboard: {
        errors: {
          ...errorsStats,
          bySeverity: errorsBySeverity
        },
        analytics: analyticsStats,
        feedback: {
          ...feedbackStats,
          averageRating,
          totalRatings: ratings.length
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to generate dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard'
    });
  }
});

/**
 * Clear data endpoint (for testing/development)
 * DELETE /api/data/:type
 */
app.delete('/api/data/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { confirm } = req.query;

    if (confirm !== 'yes') {
      return res.status(400).json({
        success: false,
        error: 'Must provide ?confirm=yes to clear data'
      });
    }

    let store;
    switch (type) {
      case 'errors':
        store = errorsStore;
        break;
      case 'analytics':
        store = analyticsStore;
        break;
      case 'feedback':
        store = feedbackStore;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid data type. Use: errors, analytics, or feedback'
        });
    }

    await store.write([]);
    console.log(`✅ Cleared ${type} data`);

    res.json({
      success: true,
      message: `${type} data cleared successfully`
    });

  } catch (error) {
    console.error('Failed to clear data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear data'
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 João Lobo Advogados Backend Server');
  console.log('=====================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Data directory: ${DATA_DIR}`);
  console.log('');

  // Log security configuration
  logSecurityInfo();

  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/csrf-token (if CSRF enabled)');
  console.log('  POST /api/errors (rate limited: 50 per 5min)');
  console.log('  GET  /api/errors');
  console.log('  POST /api/analytics (rate limited: 100 per 5min)');
  console.log('  GET  /api/analytics');
  console.log('  GET  /api/analytics/summary');
  console.log('  POST /api/feedback (rate limited: 5 per hour)');
  console.log('  GET  /api/feedback');
  console.log('  GET  /api/dashboard');
  console.log('');
  console.log('🔐 Security Features Enabled:');
  console.log('  ✓ Content Security Policy');
  console.log('  ✓ Security Headers (HSTS, X-Frame-Options, etc.)');
  console.log('  ✓ Input Validation & Sanitization');
  console.log('  ✓ Rate Limiting (global + endpoint specific)');
  console.log('  ✓ CORS Configuration');
  if (process.env.ENABLE_CSRF_PROTECTION === 'true') {
    console.log('  ✓ CSRF Protection');
  }
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  process.exit(0);
});
