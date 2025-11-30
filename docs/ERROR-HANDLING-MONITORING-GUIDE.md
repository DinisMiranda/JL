# Error Handling & Monitoring Guide
## João Lobo Advogados - Comprehensive Error Management & Performance Tracking

**Version:** 1.0
**Last Updated:** January 15, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Error Handling](#error-handling)
4. [Performance Monitoring](#performance-monitoring)
5. [User Feedback](#user-feedback)
6. [Development Tools](#development-tools)
7. [Error Pages](#error-pages)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This comprehensive error handling and monitoring system provides:

- **Global Error Handling** - Automatic capture and logging of all JavaScript errors
- **Network Error Recovery** - Retry logic and graceful degradation for network failures
- **Performance Monitoring** - Core Web Vitals tracking and metrics collection
- **User Feedback** - Error reporting forms and satisfaction surveys
- **Development Tools** - Debug panel, network monitor, and console logging
- **Custom Error Pages** - User-friendly 404 and 500 error pages

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface                         │
├─────────────────────────────────────────────────────────┤
│ Error Notifications │ Feedback Forms │ Debug Panel      │
├─────────────────────────────────────────────────────────┤
│                   Core Systems                           │
├─────────────────────────────────────────────────────────┤
│ Error Handler │ Perf Monitor │ Network Monitor │ Logger │
├─────────────────────────────────────────────────────────┤
│                   Data Layer                             │
├─────────────────────────────────────────────────────────┤
│ Error Store │ Metrics Store │ Feedback Store │ Logs     │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Automatic Initialization

The system initializes automatically when your application loads:

```javascript
// In src/main.js (already configured)
import { initErrorHandler } from './utils/error-handler.js';
import { initPerformanceMonitoring } from './utils/performance-monitor.js';
import { initFeedbackSystem } from './utils/feedback-system.js';
import { initDebugTools } from './utils/debug-tools.js';

// Initialize in your app
function initializeApp() {
  initializeErrorHandling();
  // ... other initialization
}
```

### Accessing Global Instances

All systems are exposed on the `window` object for easy access:

```javascript
// Error handling
window.__ERROR_HANDLER__.globalErrorHandler
window.__ERROR_HANDLER__.networkErrorHandler
window.__ERROR_HANDLER__.formErrorHandler

// Performance monitoring
window.__PERFORMANCE__.performanceMonitor
window.__PERFORMANCE__.analyticsTracker

// User feedback
window.__FEEDBACK__.errorReportForm
window.__FEEDBACK__.satisfactionSurvey

// Debug tools (development only)
window.__DEV__.logger
window.__DEV__.network
```

---

## Error Handling

### Global Error Handler

Automatically captures all uncaught errors and unhandled promise rejections.

#### Features

- **Automatic Error Capture** - No manual try-catch needed
- **Error Categorization** - Classified by type and severity
- **User Notifications** - Friendly error messages for users
- **Error Persistence** - Errors stored for analysis
- **Server Logging** - Optional backend integration

#### Error Types

```javascript
import { ErrorType } from './utils/error-handler.js';

ErrorType.NETWORK      // Network connectivity issues
ErrorType.VALIDATION   // Form validation errors
ErrorType.RUNTIME      // JavaScript runtime errors
ErrorType.PERMISSION   // Permission denied errors
ErrorType.NOT_FOUND    // Resource not found (404)
ErrorType.SERVER       // Server errors (500)
ErrorType.TIMEOUT      // Request timeouts
ErrorType.UNKNOWN      // Unknown errors
```

#### Severity Levels

```javascript
import { ErrorSeverity } from './utils/error-handler.js';

ErrorSeverity.LOW       // Minor issues, no user impact
ErrorSeverity.MEDIUM    // Moderate impact, degraded UX
ErrorSeverity.HIGH      // Significant impact, feature broken
ErrorSeverity.CRITICAL  // Critical failure, app unusable
```

#### Manual Error Handling

```javascript
import { errorHandler } from './utils/error-handler.js';

// Handle a custom error
errorHandler.handleError({
  type: ErrorType.VALIDATION,
  message: 'Invalid email address',
  severity: ErrorSeverity.MEDIUM,
  context: { field: 'email', value: 'invalid@' }
});

// Add error listener
errorHandler.addListener((error) => {
  console.log('Error occurred:', error);
  // Custom error handling logic
});
```

### Network Error Handler

Provides automatic retry logic and graceful degradation for network requests.

#### Features

- **Automatic Retries** - Exponential backoff for failed requests
- **Network Status Monitoring** - Online/offline detection
- **Request Queuing** - Queue requests when offline
- **Timeout Handling** - Automatic timeout detection

#### Usage

```javascript
import { networkHandler } from './utils/error-handler.js';

// Wrap fetch with retry logic
try {
  const response = await networkHandler.fetch(
    '/api/data',
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      maxRetries: 3,
      retryDelay: 1000,
      onRetry: (attempt, maxRetries) => {
        console.log(`Retry attempt ${attempt}/${maxRetries}`);
      }
    }
  );

  const data = await response.json();

} catch (error) {
  console.error('Request failed after retries:', error);
}

// Check network status
if (networkHandler.isOnline()) {
  // Proceed with network request
} else {
  // Show offline message
}
```

### Form Error Handler

Specialized error handling for form submissions.

#### Features

- **Validation Error Display** - Highlight invalid fields
- **Success Messages** - Confirmation after successful submission
- **Loading States** - Disable form during submission
- **Error Recovery** - Allow users to fix and retry

#### Usage

```javascript
import { formHandler } from './utils/error-handler.js';

const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const result = await formHandler.handleSubmit(form, async () => {
    // Your submission logic
    const formData = new FormData(form);
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return response.json();
  });

  if (result) {
    console.log('Form submitted successfully:', result);
  }
});
```

### Error Storage

Access stored errors for analysis:

```javascript
import { errorStore } from './utils/error-handler.js';

// Get all errors
const allErrors = errorStore.getAll();

// Get recent errors
const recentErrors = errorStore.getRecent(10);

// Clear errors
errorStore.clear();
```

---

## Performance Monitoring

### Core Web Vitals

Automatically tracks the three Core Web Vitals metrics:

#### Metrics Tracked

1. **LCP (Largest Contentful Paint)** - Loading performance
   - Good: ≤ 2.5s
   - Needs Improvement: 2.5s - 4.0s
   - Poor: > 4.0s

2. **FID (First Input Delay)** - Interactivity
   - Good: ≤ 100ms
   - Needs Improvement: 100ms - 300ms
   - Poor: > 300ms

3. **CLS (Cumulative Layout Shift)** - Visual stability
   - Good: ≤ 0.1
   - Needs Improvement: 0.1 - 0.25
   - Poor: > 0.25

#### Additional Metrics

- **FCP (First Contentful Paint)** - Time to first content
- **TTFB (Time to First Byte)** - Server response time
- **Navigation Timing** - Complete page load breakdown
- **Resource Timing** - Individual resource load times
- **Long Tasks** - JavaScript tasks > 50ms

### Performance Monitor

#### Usage

```javascript
import { performanceMonitor } from './utils/performance-monitor.js';

// Get performance summary
const summary = performanceMonitor.getSummary();
console.log('Performance Summary:', summary);

// Access specific metrics
console.log('Web Vitals:', performanceMonitor.metrics.webVitals);
console.log('Navigation:', performanceMonitor.metrics.navigation);
console.log('Resources:', performanceMonitor.metrics.resources);
```

### Analytics Tracker

Track custom events and user interactions:

```javascript
import { analyticsTracker } from './utils/performance-monitor.js';

// Track custom event
analyticsTracker.trackEvent(
  'engagement',      // category
  'video_play',      // action
  'homepage_intro',  // label
  120               // value (optional)
);

// Automatic tracking includes:
// - Page views
// - Time on page
// - Scroll depth
// - Click tracking
// - Form submissions
```

### Memory Monitor

Track JavaScript memory usage:

```javascript
import { memoryMonitor } from './utils/performance-monitor.js';

// Get current memory usage
const memory = memoryMonitor.getLatest();
console.log('Memory Usage:', memory.percentage + '%');
```

### Metrics Storage

Access collected metrics:

```javascript
import { metricsStore } from './utils/performance-monitor.js';

// Get all metrics
const allMetrics = metricsStore.getAll();

// Manually flush to server
metricsStore.flush();
```

---

## User Feedback

### Error Report Form

Allow users to report errors they encounter.

#### Features

- **Detailed Error Context** - Capture error details automatically
- **User Description** - Let users describe what happened
- **Reproduction Steps** - Optional steps to reproduce
- **Email Contact** - Optional follow-up
- **Session Limits** - Prevent spam

#### Usage

```javascript
import { errorReportForm } from './utils/feedback-system.js';

// Show error report form
errorReportForm.show({
  message: 'Failed to load user profile',
  type: 'runtime',
  severity: 'high'
});

// Or show from a button
document.getElementById('report-error-btn').addEventListener('click', () => {
  errorReportForm.show();
});
```

### Satisfaction Survey

Collect user satisfaction ratings.

#### Features

- **5-Point Rating Scale** - Emoji-based ratings
- **Automatic Triggers** - Show after time or scroll
- **Session Limits** - Don't annoy users
- **Analytics Integration** - Track ratings over time

#### Usage

```javascript
import { satisfactionSurvey } from './utils/feedback-system.js';

// Manual trigger
satisfactionSurvey.show();

// Automatic initialization
// Already configured in main.js to show after:
// - 60 seconds on page
// - 75% scroll depth
```

### Accessibility Feedback

Specialized feedback for accessibility issues.

#### Usage

```javascript
import { accessibilityFeedback } from './utils/feedback-system.js';

// Show accessibility feedback form
accessibilityFeedback.show();

// Add to footer or accessibility statement
<button onclick="window.__FEEDBACK__.accessibilityFeedback.show()">
  Report Accessibility Issue
</button>
```

### Feedback Storage

```javascript
import { feedbackStore } from './utils/feedback-system.js';

// Check submission count
const count = feedbackStore.getCount();

// Check if user can submit more feedback
if (feedbackStore.canSubmit()) {
  // Show feedback form
}
```

---

## Development Tools

### Development Mode Indicator

Visual indicator showing development mode is active.

#### Features

- **Persistent Badge** - Top-right corner indicator
- **Debug Panel Access** - Click to open debug tools
- **Environment Info** - Displays current environment
- **Responsive** - Adapts to mobile screens

### Debug Panel

Comprehensive debugging interface with multiple tabs.

#### Tabs

1. **Logs** - All application logs with filtering
2. **Network** - Network request monitoring
3. **Performance** - Performance metrics and timing
4. **Storage** - LocalStorage, SessionStorage, Cookies

#### Opening the Debug Panel

```javascript
// Click the tools icon in dev indicator
// OR
window.__DEV__.logger.showDebugPanel();
```

### Development Logger

Enhanced console logging for development.

#### Features

- **Categorized Logs** - Organize by feature
- **Time Tracking** - Milliseconds since app start
- **Log Persistence** - Save logs across page reloads
- **Color Coding** - Visual distinction by level

#### Usage

```javascript
import { devLogger } from './utils/debug-tools.js';

// Log with different levels
devLogger.debug('AUTH', 'User logged in', { userId: 123 });
devLogger.info('DATA', 'Data fetched successfully', data);
devLogger.warn('CACHE', 'Cache miss for key:', key);
devLogger.error('API', 'Failed to fetch data', error);

// Performance timing
devLogger.time('data-fetch');
// ... do work ...
devLogger.timeEnd('data-fetch');

// Environment info
// Automatically logged on init
```

### Network Monitor

Intercepts and logs all network requests.

#### Features

- **Fetch Interception** - Monitors all fetch requests
- **XHR Interception** - Monitors XMLHttpRequest
- **Request Details** - URL, method, status, duration
- **Error Tracking** - Captures network failures

#### Usage

```javascript
import { networkMonitor } from './utils/debug-tools.js';

// Get all requests
const requests = networkMonitor.getRequests();

// Clear request history
networkMonitor.clear();

// Automatic logging to console
// All requests are logged with color-coded status
```

### Global Access

All development tools are accessible via `window.__DEV__`:

```javascript
// In browser console
__DEV__.logger.logs()        // Get all logs
__DEV__.network.getRequests() // Get all network requests
__DEV__.logger.showDebugPanel() // Open debug panel
```

---

## Error Pages

### 404 Page - Page Not Found

Professional 404 error page with:
- Clear error message
- Suggested pages (home, services, contact, FAQ)
- Back navigation options
- Analytics tracking
- Responsive design
- Animated entrance

**Location:** `/404.html`

#### Features

- **Helpful Suggestions** - Links to main sections
- **Search Integration** - Optional search box
- **Error Tracking** - Logs to analytics
- **User-Friendly** - Clear, non-technical language

### 500 Page - Server Error

Server error page with:
- Explanation of the issue
- Retry functionality
- Contact information
- Status indicator
- Help options

**Location:** `/500.html`

#### Features

- **Auto-Retry** - Optional automatic retry (commented out)
- **Status Updates** - Visual loading indicator
- **Contact Info** - Direct email and phone
- **Troubleshooting Tips** - What users can do

#### Server Configuration

Configure your server to use these error pages:

**Apache (.htaccess):**
```apache
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
```

**Nginx:**
```nginx
error_page 404 /404.html;
error_page 500 /500.html;
```

**Vite (vite.config.js):**
```javascript
export default {
  // ... other config
  preview: {
    error404: '/404.html'
  }
}
```

---

## Best Practices

### Error Handling

1. **Let Global Handler Catch Errors**
   - Don't suppress errors with empty catch blocks
   - Let errors bubble up for centralized handling

2. **Provide Context**
   - Include relevant information in error messages
   - Add custom properties to errors

3. **User-Friendly Messages**
   - Don't show technical errors to users
   - Provide actionable instructions

4. **Log Everything**
   - Even handled errors should be logged
   - Include stack traces

### Performance Monitoring

1. **Monitor Core Web Vitals**
   - Track LCP, FID, and CLS regularly
   - Set up alerts for poor metrics

2. **Optimize Critical Path**
   - Minimize resources blocking FCP
   - Defer non-critical scripts

3. **Track User Interactions**
   - Monitor which features are used
   - Identify slow interactions

4. **Regular Reviews**
   - Review performance metrics weekly
   - Compare trends over time

### User Feedback

1. **Make Reporting Easy**
   - Prominent "Report Issue" buttons
   - Pre-fill error details

2. **Respond to Feedback**
   - Acknowledge user reports
   - Follow up on critical issues

3. **Limit Survey Frequency**
   - Don't annoy users with too many surveys
   - Respect session limits

4. **Act on Feedback**
   - Review feedback regularly
   - Prioritize common issues

### Development

1. **Use Debug Tools**
   - Open debug panel frequently
   - Review logs and network requests

2. **Test Error Scenarios**
   - Simulate network failures
   - Test form validation

3. **Profile Performance**
   - Use browser DevTools
   - Check Web Vitals in development

4. **Clean Up Console**
   - Remove debug logs before production
   - Use proper log levels

---

## Troubleshooting

### Error Handler Not Working

**Symptoms:** Errors not being caught or logged

**Solutions:**
1. Check initialization order (error handler should be first)
2. Verify imports are correct
3. Check browser console for initialization errors
4. Ensure `window.__ERROR_HANDLER__` exists

### Performance Metrics Not Showing

**Symptoms:** No Web Vitals data

**Solutions:**
1. Some metrics need user interaction (FID)
2. Check browser support for Performance Observer
3. Wait for page load to complete
4. Verify metrics in browser DevTools Performance tab

### Feedback Forms Not Appearing

**Symptoms:** Satisfaction survey doesn't show

**Solutions:**
1. Check session submission limit (max 3 per session)
2. Verify triggers are met (time/scroll)
3. Clear sessionStorage to reset
4. Check initialization in main.js

### Debug Panel Not Opening

**Symptoms:** Clicking tools button does nothing

**Solutions:**
1. Only available in development mode
2. Check `import.meta.env.MODE !== 'production'`
3. Verify click event listeners attached
4. Check browser console for JavaScript errors

### Network Monitor Not Logging

**Symptoms:** No network requests shown

**Solutions:**
1. Only works after initialization
2. Verify `window.__DEV__.network` exists
3. Check that requests use fetch or XHR
4. Look in browser Network tab as fallback

---

## Configuration

### Error Handler Configuration

```javascript
const errorConfig = {
  logToConsole: true,           // Log to browser console
  logToServer: false,           // Send to backend (enable when ready)
  showUserNotifications: true,  // Show error notifications to users
  maxRetries: 3,                // Network request retries
  retryDelay: 1000,             // Delay between retries (ms)
  serverEndpoint: '/api/errors', // Backend endpoint
  environment: 'development'    // Current environment
};
```

### Performance Configuration

```javascript
const perfConfig = {
  enabled: true,                // Enable monitoring
  logToConsole: true,           // Log metrics to console
  sendToAnalytics: false,       // Send to backend (enable when ready)
  sampleRate: 1.0,              // 100% of sessions (0.0 - 1.0)
  endpoint: '/api/analytics',   // Backend endpoint
  bufferSize: 50,               // Metrics buffer size
  flushInterval: 30000          // Flush interval (ms)
};
```

### Feedback Configuration

```javascript
const feedbackConfig = {
  enabled: true,                // Enable feedback system
  endpoint: '/api/feedback',    // Backend endpoint
  showAfterSeconds: 60,         // Survey delay (seconds)
  showAfterScrollPercent: 75,   // Survey trigger (scroll %)
  maxSubmissionsPerSession: 3   // Submission limit
};
```

### Debug Configuration

```javascript
const debugConfig = {
  enabled: true,                // Enable debug tools (dev only)
  logLevel: 'debug',            // debug, info, warn, error
  showPerformance: true,        // Show performance logs
  showNetwork: true,            // Show network logs
  showErrors: true,             // Show error logs
  persistLogs: true,            // Save logs to localStorage
  maxLogs: 1000                 // Maximum logs to store
};
```

---

## Backend Integration

### Error Logging Endpoint

```javascript
// POST /api/errors
{
  "type": "runtime",
  "message": "Cannot read property 'x' of undefined",
  "severity": "high",
  "stack": "Error: ...\n    at ...",
  "userAgent": "Mozilla/5.0...",
  "url": "https://joaoloboadvogados.pt/about",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Analytics Endpoint

```javascript
// POST /api/analytics
{
  "metrics": [
    {
      "type": "web-vital",
      "metric": "LCP",
      "value": 2341.5,
      "rating": "Good",
      "timestamp": 1705318200000,
      "sessionId": "session_1705318200000_abc123"
    }
  ]
}
```

### Feedback Endpoint

```javascript
// POST /api/feedback
{
  "type": "error_report",
  "errorType": "form_error",
  "description": "Contact form won't submit",
  "steps": "1. Fill form\n2. Click submit\n3. Nothing happens",
  "email": "user@example.com",
  "context": {
    "url": "https://joaoloboadvogados.pt/contact",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

---

## Testing

### Manual Testing

1. **Test Error Handling**
   ```javascript
   // Trigger an error
   throw new Error('Test error');

   // Should see:
   // - Error logged to console
   // - User notification displayed
   // - Error stored in errorStore
   ```

2. **Test Network Errors**
   ```javascript
   // Disconnect internet and make request
   fetch('/api/test')
     .then(response => console.log('Success'))
     .catch(error => console.log('Caught:', error));

   // Should see:
   // - Retry attempts
   // - Network error notification
   // - Request failure logged
   ```

3. **Test Performance Monitoring**
   ```javascript
   // Open console and check:
   console.log(window.__PERFORMANCE__.performanceMonitor.getSummary());

   // Should see:
   // - Web Vitals (LCP, FID, CLS)
   // - Navigation timing
   // - Resource timing
   ```

4. **Test Feedback Forms**
   ```javascript
   // Show error report form
   window.__FEEDBACK__.errorReportForm.show();

   // Should see:
   // - Modal dialog
   // - Form fields
   // - Submit functionality
   ```

### Automated Testing

See `/docs/TESTING-GUIDE.md` for comprehensive testing strategies.

---

## Support

### Documentation

- Main Documentation: `/docs/CMS-README.md`
- Legal Compliance: `/docs/LEGAL-COMPLIANCE-GUIDE.md`
- This Guide: `/docs/ERROR-HANDLING-MONITORING-GUIDE.md`

### External Resources

- **Web Vitals**: [web.dev/vitals](https://web.dev/vitals/)
- **Error Handling**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- **Performance API**: [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

### Contact

For questions about error handling and monitoring:

**João Lobo Advogados**
- Email: joaojlobo@hotmail.com
- Phone: +351 915 964 547
- Address: Rua Justino Cruz, Braga, Portugal

---

## Version History

- **1.0** (2025-01-15) - Initial release
  - Global error handling
  - Performance monitoring with Core Web Vitals
  - User feedback system
  - Development debug tools
  - Error pages (404, 500)
  - Complete documentation

---

**Last Updated:** January 15, 2025
**Next Review:** February 2025

---

*This guide is part of the João Lobo Advogados website error handling and monitoring implementation.*
