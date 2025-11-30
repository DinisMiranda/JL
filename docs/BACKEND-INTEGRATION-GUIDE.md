# Backend Integration Guide

## Overview

This guide covers the setup, configuration, and usage of the Express.js backend server for João Lobo Advogados website. The backend provides REST API endpoints for error logging, analytics tracking, and user feedback collection.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Server Architecture](#server-architecture)
3. [API Endpoints](#api-endpoints)
4. [Environment Configuration](#environment-configuration)
5. [Data Storage](#data-storage)
6. [Testing the API](#testing-the-api)
7. [Production Deployment](#production-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your configuration
   # See Environment Configuration section below
   ```

3. **Start the Server:**

   **Development Mode (with auto-reload):**
   ```bash
   npm run server:dev
   ```

   **Production Mode:**
   ```bash
   npm run server
   ```

   **Run Both Frontend and Backend:**
   ```bash
   npm start
   ```

4. **Verify Installation:**
   ```bash
   # The server should be running on http://localhost:3001
   # Test with a health check
   curl http://localhost:3001/api/health
   ```

---

## Server Architecture

### Technology Stack

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Express Rate Limit** - Request throttling
- **dotenv** - Environment variable management

### Components

```
server/
├── index.js           # Main server file
└── data/              # JSON storage directory (auto-created)
    ├── errors.json    # Error logs
    ├── analytics.json # Performance metrics
    └── feedback.json  # User feedback
```

### Data Flow

```
Frontend Application
       ↓
  API Endpoints
       ↓
   DataStore Class
       ↓
  JSON File Storage
```

---

## API Endpoints

### Base URL

- **Development:** `http://localhost:3001`
- **Production:** Configure via `VITE_API_BASE_URL` in `.env`

### 1. Error Logging

#### POST /api/errors

Log client-side errors for monitoring and debugging.

**Request Body:**
```json
{
  "type": "runtime|network|validation|security",
  "message": "Error message",
  "severity": "low|medium|high|critical",
  "stack": "Error stack trace",
  "url": "https://example.com/page",
  "userAgent": "Mozilla/5.0...",
  "environment": "development|production",
  "metadata": {
    "component": "ContactForm",
    "action": "submit"
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "err_1234567890",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

**Example:**
```javascript
// From frontend
fetch('http://localhost:3001/api/errors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'runtime',
    message: 'Cannot read property of undefined',
    severity: 'high',
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    environment: 'production'
  })
});
```

#### GET /api/errors

Retrieve error logs with optional filtering.

**Query Parameters:**
- `severity` - Filter by severity (low, medium, high, critical)
- `type` - Filter by error type
- `limit` - Maximum number of results (default: 100)
- `since` - ISO date string to get errors since a specific time

**Response:**
```json
{
  "success": true,
  "count": 42,
  "errors": [
    {
      "id": "err_1234567890",
      "type": "runtime",
      "message": "Error message",
      "severity": "high",
      "timestamp": "2025-11-17T10:30:00.000Z",
      "url": "https://example.com/page",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

**Example:**
```bash
# Get all critical errors
curl "http://localhost:3001/api/errors?severity=critical"

# Get errors from the last hour
curl "http://localhost:3001/api/errors?since=2025-11-17T09:00:00.000Z"
```

### 2. Analytics & Performance Metrics

#### POST /api/analytics

Store performance metrics and analytics data.

**Request Body:**
```json
{
  "metrics": [
    {
      "type": "web-vital|custom|navigation|resource",
      "metric": "LCP|FID|CLS|FCP|TTFB|custom_event_name",
      "value": 1234.56,
      "rating": "good|needs-improvement|poor",
      "url": "https://example.com/page",
      "metadata": {
        "browser": "Chrome",
        "device": "desktop"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "ids": ["metric_1234567890"]
}
```

**Example:**
```javascript
// From frontend
fetch('http://localhost:3001/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    metrics: [
      {
        type: 'web-vital',
        metric: 'LCP',
        value: 2450.5,
        rating: 'good',
        url: window.location.href
      },
      {
        type: 'custom',
        metric: 'form_submission',
        value: 1,
        url: window.location.href,
        metadata: {
          formType: 'contact'
        }
      }
    ]
  })
});
```

#### GET /api/analytics

Retrieve analytics data with filtering.

**Query Parameters:**
- `type` - Filter by metric type
- `metric` - Filter by specific metric name
- `limit` - Maximum number of results (default: 100)
- `since` - ISO date string

**Response:**
```json
{
  "success": true,
  "count": 150,
  "metrics": [
    {
      "id": "metric_1234567890",
      "type": "web-vital",
      "metric": "LCP",
      "value": 2450.5,
      "rating": "good",
      "timestamp": "2025-11-17T10:30:00.000Z",
      "url": "https://example.com/"
    }
  ]
}
```

#### GET /api/analytics/summary

Get aggregated Web Vitals statistics.

**Query Parameters:**
- `hours` - Number of hours to analyze (default: 24)

**Response:**
```json
{
  "success": true,
  "summary": {
    "period": "Last 24 hours",
    "totalMetrics": 450,
    "webVitals": {
      "LCP": {
        "count": 100,
        "average": 2345.67,
        "median": 2200.00,
        "min": 1500.00,
        "max": 4500.00,
        "good": 75,
        "needsImprovement": 20,
        "poor": 5,
        "threshold": { "good": 2500, "poor": 4000 }
      },
      "FID": { /* ... */ },
      "CLS": { /* ... */ },
      "FCP": { /* ... */ },
      "TTFB": { /* ... */ }
    }
  }
}
```

**Example:**
```bash
# Get last 24 hours summary
curl "http://localhost:3001/api/analytics/summary"

# Get last 7 days summary
curl "http://localhost:3001/api/analytics/summary?hours=168"
```

### 3. User Feedback

#### POST /api/feedback

Store user feedback submissions.

**Request Body:**
```json
{
  "type": "error_report|satisfaction|accessibility|general",
  "description": "Feedback description",
  "email": "user@example.com",
  "rating": 5,
  "errorType": "ui|functional|performance",
  "steps": "Steps to reproduce",
  "expected": "Expected behavior",
  "wcagLevel": "A|AA|AAA",
  "location": "Homepage header",
  "includeDetails": true,
  "context": {
    "url": "https://example.com/page",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2025-11-17T10:30:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "id": "feedback_1234567890",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

**Example:**
```javascript
// Error report
fetch('http://localhost:3001/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'error_report',
    errorType: 'functional',
    description: 'Contact form not submitting',
    steps: '1. Fill form\n2. Click submit\n3. Nothing happens',
    expected: 'Form should submit successfully',
    email: 'user@example.com',
    includeDetails: true,
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }
  })
});

// Satisfaction survey
fetch('http://localhost:3001/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'satisfaction',
    rating: 5,
    description: 'Great website design!',
    improvements: 'Could use more contact options',
    recommend: true
  })
});
```

#### GET /api/feedback

Retrieve feedback submissions.

**Query Parameters:**
- `type` - Filter by feedback type
- `limit` - Maximum number of results (default: 100)
- `since` - ISO date string

**Response:**
```json
{
  "success": true,
  "count": 25,
  "feedback": [
    {
      "id": "feedback_1234567890",
      "type": "satisfaction",
      "rating": 5,
      "description": "Great website!",
      "timestamp": "2025-11-17T10:30:00.000Z"
    }
  ]
}
```

### 4. Dashboard

#### GET /api/dashboard

Get comprehensive overview of all data.

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "errors": {
      "total": 42,
      "bySeverity": {
        "low": 15,
        "medium": 20,
        "high": 5,
        "critical": 2
      },
      "byType": {
        "runtime": 25,
        "network": 10,
        "validation": 7
      },
      "recent": [ /* last 10 errors */ ]
    },
    "analytics": {
      "total": 450,
      "webVitals": { /* summary */ },
      "customEvents": { /* summary */ }
    },
    "feedback": {
      "total": 25,
      "byType": {
        "error_report": 10,
        "satisfaction": 12,
        "accessibility": 3
      },
      "averageRating": 4.5,
      "recent": [ /* last 10 submissions */ ]
    },
    "timestamp": "2025-11-17T10:30:00.000Z"
  }
}
```

**Example:**
```bash
curl "http://localhost:3001/api/dashboard"
```

### 5. Utility Endpoints

#### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T10:30:00.000Z",
  "uptime": 3600
}
```

#### DELETE /api/data/:type

Clear data for testing/development.

**Parameters:**
- `:type` - Data type to clear (errors, analytics, feedback, or all)

**Response:**
```json
{
  "success": true,
  "message": "Errors data cleared",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

**Example:**
```bash
# Clear all errors
curl -X DELETE "http://localhost:3001/api/data/errors"

# Clear all data
curl -X DELETE "http://localhost:3001/api/data/all"
```

---

## Environment Configuration

### .env File Structure

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
# Add your frontend URLs here (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# API Configuration
# Enable server logging for errors, analytics, and feedback
ENABLE_SERVER_LOGGING=true

# API Base URL (used by frontend)
VITE_API_BASE_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (optional - for feedback notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# FEEDBACK_EMAIL=joaojlobo@hotmail.com

# Google Analytics (optional)
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Sentry/Error Tracking (optional)
# SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Environment Variables Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | Number | 3001 | Server port |
| `NODE_ENV` | String | development | Environment mode |
| `CORS_ORIGIN` | String | localhost URLs | Allowed CORS origins (comma-separated) |
| `ENABLE_SERVER_LOGGING` | Boolean | true | Enable logging endpoints |
| `VITE_API_BASE_URL` | String | http://localhost:3001 | Backend API URL |
| `RATE_LIMIT_WINDOW_MS` | Number | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Number | 100 | Max requests per window |

### Frontend Environment Setup

Create `.env` file in project root:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:3001

# Enable server logging
VITE_ENABLE_SERVER_LOGGING=true

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

The frontend utilities (`error-handler.js`, `performance-monitor.js`, `feedback-system.js`) will automatically use these environment variables.

---

## Data Storage

### File Structure

All data is stored in JSON files within the `server/data/` directory:

```
server/data/
├── errors.json      # Error logs
├── analytics.json   # Performance metrics
└── feedback.json    # User feedback
```

### Data Format

Each file contains an array of objects with the following common fields:

```json
[
  {
    "id": "unique_identifier",
    "timestamp": "2025-11-17T10:30:00.000Z",
    /* ... type-specific fields ... */
  }
]
```

### Data Retention

- **Maximum Entries:** 1000 per file
- **Retention Policy:** When limit is reached, oldest entries are automatically removed
- **Backup:** No automatic backup (implement as needed)

### Accessing Data Files

**Programmatically:**
```javascript
import { readFile } from 'fs/promises';

const errors = JSON.parse(
  await readFile('./server/data/errors.json', 'utf-8')
);
```

**Manual Review:**
```bash
# View errors
cat server/data/errors.json | jq '.'

# Count entries
cat server/data/errors.json | jq 'length'

# Filter critical errors
cat server/data/errors.json | jq '.[] | select(.severity == "critical")'
```

---

## Testing the API

### Using cURL

**1. Test Error Logging:**
```bash
curl -X POST http://localhost:3001/api/errors \
  -H "Content-Type: application/json" \
  -d '{
    "type": "runtime",
    "message": "Test error",
    "severity": "high",
    "url": "http://localhost:5173/",
    "environment": "development"
  }'
```

**2. Test Analytics:**
```bash
curl -X POST http://localhost:3001/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": [
      {
        "type": "web-vital",
        "metric": "LCP",
        "value": 2450.5,
        "rating": "good"
      }
    ]
  }'
```

**3. Test Feedback:**
```bash
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "satisfaction",
    "rating": 5,
    "description": "Great website!"
  }'
```

**4. Get Dashboard:**
```bash
curl http://localhost:3001/api/dashboard | jq '.'
```

### Using JavaScript Fetch

```javascript
// Error logging test
async function testErrorLogging() {
  const response = await fetch('http://localhost:3001/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'runtime',
      message: 'Test error from client',
      severity: 'medium'
    })
  });
  const data = await response.json();
  console.log('Error logged:', data);
}

// Analytics test
async function testAnalytics() {
  const response = await fetch('http://localhost:3001/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics: [
        { type: 'web-vital', metric: 'LCP', value: 2450, rating: 'good' },
        { type: 'custom', metric: 'button_click', value: 1 }
      ]
    })
  });
  const data = await response.json();
  console.log('Metrics logged:', data);
}

// Get dashboard
async function getDashboard() {
  const response = await fetch('http://localhost:3001/api/dashboard');
  const data = await response.json();
  console.log('Dashboard:', data);
}
```

### Using Postman

1. **Import Collection:**
   - Create new collection "JL Advogados API"
   - Set base URL variable: `{{baseUrl}}` = `http://localhost:3001`

2. **Add Requests:**
   - POST `/api/errors` - Error Logging
   - POST `/api/analytics` - Analytics
   - POST `/api/feedback` - Feedback
   - GET `/api/dashboard` - Dashboard
   - GET `/api/analytics/summary` - Web Vitals Summary

3. **Test Scenarios:**
   - Test rate limiting (send >100 requests in 15 min)
   - Test CORS with different origins
   - Test data validation with invalid payloads

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure production `CORS_ORIGIN`
- [ ] Update `VITE_API_BASE_URL` to production domain
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting
- [ ] Configure backup for `server/data/`
- [ ] Review rate limiting settings
- [ ] Test all endpoints in production environment

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, Linode, etc.)

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository
git clone https://github.com/your-repo/jl-advogados.git
cd jl-advogados

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 5. Build frontend
npm run build

# 6. Start with PM2
npm install -g pm2
pm2 start server/index.js --name jl-backend
pm2 startup
pm2 save

# 7. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/jl-advogados
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name joaolobo.pt www.joaolobo.pt;

    # Frontend (static files)
    location / {
        root /var/www/jl-advogados/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Option 2: Platform as a Service (Heroku, Railway, etc.)

**Heroku:**
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create jl-advogados

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://joaolobo.pt
heroku config:set PORT=3001

# 5. Deploy
git push heroku main

# 6. Verify
heroku logs --tail
```

**Railway:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Deploy
railway up
```

#### Option 3: Serverless (Vercel, Netlify Functions)

For serverless deployment, you'll need to adapt the Express app to serverless functions. Consider using Vercel's serverless functions or AWS Lambda.

### SSL/HTTPS Setup

**Using Let's Encrypt (Certbot):**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d joaolobo.pt -d www.joaolobo.pt

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring Setup

**1. Server Logs:**
```bash
# View server logs
pm2 logs jl-backend

# Monitor server metrics
pm2 monit
```

**2. Application Monitoring:**
- Set up external monitoring (UptimeRobot, Pingdom)
- Configure alerting for critical errors
- Monitor disk space for `server/data/`

**3. Analytics Dashboard:**
Create a simple HTML dashboard to view data:

```html
<!DOCTYPE html>
<html>
<head>
    <title>JL Admin Dashboard</title>
</head>
<body>
    <h1>Monitoring Dashboard</h1>
    <div id="dashboard"></div>
    <script>
        fetch('https://api.joaolobo.pt/api/dashboard')
            .then(r => r.json())
            .then(data => {
                document.getElementById('dashboard').innerHTML =
                    `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            });
    </script>
</body>
</html>
```

---

## Monitoring and Maintenance

### Daily Tasks

1. **Check Error Logs:**
   ```bash
   curl http://localhost:3001/api/errors?severity=critical
   ```

2. **Monitor Performance:**
   ```bash
   curl http://localhost:3001/api/analytics/summary?hours=24
   ```

3. **Review Feedback:**
   ```bash
   curl http://localhost:3001/api/feedback | jq '.feedback[] | select(.type == "error_report")'
   ```

### Weekly Tasks

1. **Review Web Vitals Trends:**
   ```bash
   curl "http://localhost:3001/api/analytics/summary?hours=168" | jq '.summary.webVitals'
   ```

2. **Analyze User Feedback:**
   - Review satisfaction ratings
   - Address accessibility reports
   - Respond to error reports

3. **Data Cleanup:**
   ```bash
   # Backup old data
   cp server/data/errors.json server/data/backup/errors_$(date +%Y%m%d).json

   # Clear test data if needed
   curl -X DELETE "http://localhost:3001/api/data/errors?test=true"
   ```

### Monthly Tasks

1. **Performance Analysis:**
   - Compare Web Vitals month-over-month
   - Identify performance regressions
   - Plan optimizations

2. **Error Pattern Analysis:**
   - Identify recurring errors
   - Update error handling based on patterns
   - Fix root causes

3. **User Feedback Review:**
   - Aggregate satisfaction scores
   - Identify common feature requests
   - Plan improvements

### Backup Strategy

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-data.sh

BACKUP_DIR="./server/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup all data files
cp server/data/errors.json "$BACKUP_DIR/errors_$DATE.json"
cp server/data/analytics.json "$BACKUP_DIR/analytics_$DATE.json"
cp server/data/feedback.json "$BACKUP_DIR/feedback_$DATE.json"

# Compress
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR"/*_$DATE.json

# Clean up individual files
rm "$BACKUP_DIR"/*_$DATE.json

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

**Cron Job Setup:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-data.sh
```

---

## Troubleshooting

### Common Issues

#### 1. Server Won't Start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001
# or on Windows
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>
# or on Windows
taskkill /PID <PID> /F

# Restart server
npm run server:dev
```

#### 2. CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:3001/api/errors' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
```bash
# Update .env file
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Restart server
pm2 restart jl-backend
```

#### 3. Data Not Persisting

**Symptoms:**
- API responds with success but data doesn't appear in JSON files

**Solution:**
```bash
# Check file permissions
ls -la server/data/

# Ensure directory exists
mkdir -p server/data

# Check disk space
df -h

# Verify write permissions
touch server/data/test.txt
rm server/data/test.txt
```

#### 4. Rate Limiting Issues

**Symptoms:**
```json
{
  "error": "Too many requests, please try again later"
}
```

**Solution:**
```bash
# Adjust rate limits in .env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Restart server
pm2 restart jl-backend
```

#### 5. Frontend Can't Connect to Backend

**Symptoms:**
- Network errors in browser console
- Fetch requests failing

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:3001/api/health

# 2. Verify frontend env variables
cat .env | grep VITE_API_BASE_URL

# 3. Ensure CORS is configured
cat .env | grep CORS_ORIGIN

# 4. Rebuild frontend with env vars
npm run build
```

### Debug Mode

Enable detailed logging:

```javascript
// In server/index.js, add:
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
});
```

### Health Checks

**Server Health:**
```bash
# Basic health check
curl http://localhost:3001/api/health

# Check if all endpoints respond
curl http://localhost:3001/api/dashboard
```

**Data Integrity:**
```bash
# Validate JSON files
node -e "JSON.parse(require('fs').readFileSync('server/data/errors.json'))"
node -e "JSON.parse(require('fs').readFileSync('server/data/analytics.json'))"
node -e "JSON.parse(require('fs').readFileSync('server/data/feedback.json'))"
```

---

## Next Steps

1. **Implement Email Notifications:**
   - Add nodemailer for email alerts
   - Send notifications for critical errors
   - Email feedback submissions to admin

2. **Add Database Support:**
   - Migrate from JSON to PostgreSQL/MongoDB
   - Improve query performance
   - Better data management

3. **Enhanced Analytics:**
   - Add data visualization dashboard
   - Implement trend analysis
   - Create custom reports

4. **Authentication:**
   - Protect admin endpoints
   - Add API keys for external access
   - Implement user roles

5. **Advanced Monitoring:**
   - Integrate with Sentry/LogRocket
   - Set up real-time alerts
   - Add performance tracking

---

## Support

For issues or questions:
- Check the [Error Handling Guide](./ERROR-HANDLING-MONITORING-GUIDE.md)
- Review server logs: `pm2 logs jl-backend`
- Check data files: `ls -la server/data/`

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
