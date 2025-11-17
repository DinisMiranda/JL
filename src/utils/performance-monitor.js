/**
 * Performance Monitor
 * Track performance metrics, Core Web Vitals, and user interactions
 */

/**
 * Performance configuration
 */
const PERF_CONFIG = {
  enabled: true,
  logToConsole: true,
  sendToAnalytics: import.meta.env.VITE_ENABLE_SERVER_LOGGING === 'true' || false,
  sampleRate: 1.0, // 100% of sessions
  endpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/analytics`,
  bufferSize: 50,
  flushInterval: 30000 // 30 seconds
};

/**
 * Core Web Vitals thresholds
 */
const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte
};

/**
 * Performance Metrics Store
 */
class MetricsStore {
  constructor() {
    this.metrics = [];
    this.maxSize = PERF_CONFIG.bufferSize;
  }

  add(metric) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    });

    if (this.metrics.length >= this.maxSize) {
      this.flush();
    }
  }

  flush() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    if (PERF_CONFIG.sendToAnalytics) {
      this.sendToServer(metricsToSend);
    }
  }

  async sendToServer(metrics) {
    try {
      await fetch(PERF_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
        keepalive: true // Send even if page is unloading
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('perf_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('perf_session_id', sessionId);
    }
    return sessionId;
  }

  getAll() {
    return this.metrics;
  }
}

export const metricsStore = new MetricsStore();

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  constructor(config = {}) {
    this.config = { ...PERF_CONFIG, ...config };
    this.observers = [];
    this.metrics = {
      navigation: {},
      resources: [],
      userInteractions: [],
      webVitals: {}
    };
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (!this.config.enabled) return;

    // Sample based on rate
    if (Math.random() > this.config.sampleRate) return;

    // Track navigation timing
    this.trackNavigationTiming();

    // Track resource timing
    this.trackResourceTiming();

    // Track Core Web Vitals
    this.trackWebVitals();

    // Track user interactions
    this.trackUserInteractions();

    // Track long tasks
    this.trackLongTasks();

    // Periodic flush
    setInterval(() => metricsStore.flush(), this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => metricsStore.flush());

    console.log('📊 Performance monitoring initialized');
  }

  /**
   * Track navigation timing
   */
  trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return;

        const metrics = {
          type: 'navigation',
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domInteractive: perfData.domInteractive,
          domComplete: perfData.domComplete,
          loadComplete: perfData.loadEventEnd,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        };

        this.metrics.navigation = metrics;
        metricsStore.add(metrics);

        if (this.config.logToConsole) {
          this.logNavigationMetrics(metrics);
        }
      }, 0);
    });
  }

  /**
   * Log navigation metrics
   */
  logNavigationMetrics(metrics) {
    console.group('📈 Navigation Timing');
    console.log('DNS Lookup:', metrics.dns.toFixed(2), 'ms');
    console.log('TCP Connection:', metrics.tcp.toFixed(2), 'ms');
    console.log('TTFB:', metrics.ttfb.toFixed(2), 'ms', this.getRating(metrics.ttfb, WEB_VITALS_THRESHOLDS.TTFB));
    console.log('Download:', metrics.download.toFixed(2), 'ms');
    console.log('DOM Interactive:', metrics.domInteractive.toFixed(2), 'ms');
    console.log('DOM Complete:', metrics.domComplete.toFixed(2), 'ms');
    console.log('Page Load:', metrics.loadComplete.toFixed(2), 'ms');
    console.log('Total Time:', metrics.totalTime.toFixed(2), 'ms');
    console.groupEnd();
  }

  /**
   * Track resource timing
   */
  trackResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');

      const resourceMetrics = resources.map(resource => ({
        type: 'resource',
        name: resource.name,
        resourceType: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize,
        cached: resource.transferSize === 0
      }));

      this.metrics.resources = resourceMetrics;

      // Log slow resources
      const slowResources = resourceMetrics.filter(r => r.duration > 1000);
      if (slowResources.length > 0 && this.config.logToConsole) {
        console.group('⚠️ Slow Resources (>1s)');
        slowResources.forEach(r => {
          console.log(`${r.resourceType}: ${r.name}`, `${r.duration.toFixed(2)}ms`);
        });
        console.groupEnd();
      }

      // Add to metrics store
      resourceMetrics.forEach(metric => metricsStore.add(metric));
    });
  }

  /**
   * Track Core Web Vitals
   */
  trackWebVitals() {
    // LCP - Largest Contentful Paint
    this.observeLCP();

    // FID - First Input Delay
    this.observeFID();

    // CLS - Cumulative Layout Shift
    this.observeCLS();

    // FCP - First Contentful Paint
    this.observeFCP();
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.metrics.webVitals.LCP = lcp;

        metricsStore.add({
          type: 'web-vital',
          metric: 'LCP',
          value: lcp,
          rating: this.getRating(lcp, WEB_VITALS_THRESHOLDS.LCP)
        });

        if (this.config.logToConsole) {
          console.log('🎨 LCP:', lcp.toFixed(2), 'ms', this.getRating(lcp, WEB_VITALS_THRESHOLDS.LCP));
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation not supported');
    }
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.metrics.webVitals.FID = fid;

          metricsStore.add({
            type: 'web-vital',
            metric: 'FID',
            value: fid,
            rating: this.getRating(fid, WEB_VITALS_THRESHOLDS.FID)
          });

          if (this.config.logToConsole) {
            console.log('⚡ FID:', fid.toFixed(2), 'ms', this.getRating(fid, WEB_VITALS_THRESHOLDS.FID));
          }
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation not supported');
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        this.metrics.webVitals.CLS = clsValue;

        metricsStore.add({
          type: 'web-vital',
          metric: 'CLS',
          value: clsValue,
          rating: this.getRating(clsValue, WEB_VITALS_THRESHOLDS.CLS)
        });

        if (this.config.logToConsole) {
          console.log('📐 CLS:', clsValue.toFixed(3), this.getRating(clsValue, WEB_VITALS_THRESHOLDS.CLS));
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation not supported');
    }
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            this.metrics.webVitals.FCP = fcp;

            metricsStore.add({
              type: 'web-vital',
              metric: 'FCP',
              value: fcp,
              rating: this.getRating(fcp, WEB_VITALS_THRESHOLDS.FCP)
            });

            if (this.config.logToConsole) {
              console.log('🎨 FCP:', fcp.toFixed(2), 'ms', this.getRating(fcp, WEB_VITALS_THRESHOLDS.FCP));
            }
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation not supported');
    }
  }

  /**
   * Get rating for metric
   */
  getRating(value, thresholds) {
    if (value <= thresholds.good) return '✅ Good';
    if (value <= thresholds.needsImprovement) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  /**
   * Track user interactions
   */
  trackUserInteractions() {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [role="button"]');
      if (target) {
        this.trackInteraction('click', target);
      }
    }, true);

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackInteraction('submit', e.target);
    }, true);

    // Track scroll depth
    this.trackScrollDepth();
  }

  /**
   * Track interaction
   */
  trackInteraction(type, element) {
    const metric = {
      type: 'interaction',
      interactionType: type,
      element: this.getElementDescriptor(element),
      url: window.location.href
    };

    this.metrics.userInteractions.push(metric);
    metricsStore.add(metric);
  }

  /**
   * Get element descriptor
   */
  getElementDescriptor(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      text: element.textContent?.substring(0, 50)
    };
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth() {
    let maxScroll = 0;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        const roundedPercent = Math.floor(scrollPercent / 25) * 25; // Round to 0, 25, 50, 75, 100

        if (roundedPercent > maxScroll) {
          maxScroll = roundedPercent;

          metricsStore.add({
            type: 'scroll-depth',
            depth: roundedPercent,
            url: window.location.href
          });
        }
      }, 100);
    });
  }

  /**
   * Track long tasks
   */
  trackLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          metricsStore.add({
            type: 'long-task',
            duration: entry.duration,
            startTime: entry.startTime
          });

          if (this.config.logToConsole) {
            console.warn('⏱️ Long Task detected:', entry.duration.toFixed(2), 'ms');
          }
        });
      });

      observer.observe({ type: 'longtask', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task observation not supported');
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    return {
      navigation: this.metrics.navigation,
      webVitals: this.metrics.webVitals,
      resources: {
        total: this.metrics.resources.length,
        slow: this.metrics.resources.filter(r => r.duration > 1000).length,
        cached: this.metrics.resources.filter(r => r.cached).length
      },
      interactions: {
        total: this.metrics.userInteractions.length,
        byType: this.groupBy(this.metrics.userInteractions, 'interactionType')
      }
    };
  }

  /**
   * Group by helper
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * User Analytics Tracker
 */
export class AnalyticsTracker {
  constructor() {
    this.events = [];
    this.init();
  }

  /**
   * Initialize analytics
   */
  init() {
    // Track page views
    this.trackPageView();

    // Track time on page
    this.trackTimeOnPage();

    // Track visibility changes
    this.trackVisibilityChanges();
  }

  /**
   * Track page view
   */
  trackPageView() {
    metricsStore.add({
      type: 'pageview',
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });
  }

  /**
   * Track custom event
   */
  trackEvent(category, action, label, value) {
    const event = {
      type: 'event',
      category,
      action,
      label,
      value
    };

    this.events.push(event);
    metricsStore.add(event);

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  /**
   * Track time on page
   */
  trackTimeOnPage() {
    const startTime = Date.now();

    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;

      metricsStore.add({
        type: 'time-on-page',
        duration: timeOnPage,
        url: window.location.href
      });
    });
  }

  /**
   * Track visibility changes
   */
  trackVisibilityChanges() {
    let visibilityStart = Date.now();
    let totalVisible = 0;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        totalVisible += Date.now() - visibilityStart;
      } else {
        visibilityStart = Date.now();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (!document.hidden) {
        totalVisible += Date.now() - visibilityStart;
      }

      metricsStore.add({
        type: 'visibility',
        totalVisible,
        url: window.location.href
      });
    });
  }
}

/**
 * Memory Monitor
 */
export class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.init();
  }

  /**
   * Initialize memory monitoring
   */
  init() {
    if (!performance.memory) {
      console.warn('Memory API not available');
      return;
    }

    // Measure every minute
    setInterval(() => this.measure(), 60000);

    // Initial measurement
    this.measure();
  }

  /**
   * Take memory measurement
   */
  measure() {
    if (!performance.memory) return;

    const measurement = {
      type: 'memory',
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
    };

    this.measurements.push(measurement);
    metricsStore.add(measurement);

    // Warn if high memory usage
    if (measurement.percentage > 90) {
      console.warn('⚠️ High memory usage:', measurement.percentage + '%');
    }
  }

  /**
   * Get latest measurement
   */
  getLatest() {
    return this.measurements[this.measurements.length - 1];
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring(config = {}) {
  const performanceMonitor = new PerformanceMonitor(config);
  const analyticsTracker = new AnalyticsTracker();
  const memoryMonitor = new MemoryMonitor();

  return {
    performanceMonitor,
    analyticsTracker,
    memoryMonitor,
    metricsStore
  };
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const analyticsTracker = new AnalyticsTracker();
export const memoryMonitor = new MemoryMonitor();
