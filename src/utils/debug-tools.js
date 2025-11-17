/**
 * Development Debugging Tools
 * Console logging, performance profiling, and network monitoring
 */

/**
 * Debug configuration
 */
const DEBUG_CONFIG = {
  enabled: import.meta.env.MODE !== 'production',
  logLevel: 'debug', // debug, info, warn, error
  showPerformance: true,
  showNetwork: true,
  showErrors: true,
  persistLogs: true,
  maxLogs: 1000
};

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

/**
 * Development Logger
 */
export class DevLogger {
  constructor(config = {}) {
    this.config = { ...DEBUG_CONFIG, ...config };
    this.logs = [];
    this.startTime = Date.now();
    this.groups = new Map();

    if (this.config.enabled) {
      this.init();
    }
  }

  /**
   * Initialize logger
   */
  init() {
    // Show dev mode indicator
    this.showDevIndicator();

    // Load persisted logs
    if (this.config.persistLogs) {
      this.loadLogs();
    }

    // Log environment info
    this.logEnvironment();

    console.log('%c🔧 Development Mode Enabled', 'background: #667eea; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold');
  }

  /**
   * Show development mode indicator
   */
  showDevIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'dev-mode-indicator';
    indicator.innerHTML = `
      <div class="dev-indicator-content">
        <span class="dev-indicator-badge">DEV</span>
        <span class="dev-indicator-text">Development Mode</span>
        <button class="dev-indicator-tools" title="Debug Tools">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    // Add styles
    this.injectIndicatorStyles();

    document.body.appendChild(indicator);

    // Add click handler for tools button
    indicator.querySelector('.dev-indicator-tools').addEventListener('click', () => {
      this.showDebugPanel();
    });
  }

  /**
   * Inject indicator styles
   */
  injectIndicatorStyles() {
    if (document.getElementById('dev-indicator-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'dev-indicator-styles';
    style.textContent = `
      #dev-mode-indicator {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .dev-indicator-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font-size: 0.75rem;
      }

      .dev-indicator-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.125rem 0.375rem;
        border-radius: 3px;
        font-weight: 700;
        font-size: 0.625rem;
        letter-spacing: 0.5px;
      }

      .dev-indicator-text {
        font-weight: 500;
      }

      .dev-indicator-tools {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        border-radius: 3px;
        transition: background-color 0.2s;
      }

      .dev-indicator-tools:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 640px) {
        #dev-mode-indicator {
          top: auto;
          bottom: 10px;
        }

        .dev-indicator-text {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Log environment info
   */
  logEnvironment() {
    console.group('🌍 Environment Information');
    console.log('Mode:', import.meta.env.MODE || 'production');
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen:', `${window.screen.width}x${window.screen.height}`);
    console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
    console.log('Language:', navigator.language);
    console.log('Online:', navigator.onLine);
    console.log('Cookies Enabled:', navigator.cookieEnabled);
    console.groupEnd();
  }

  /**
   * Log message
   */
  log(level, category, message, ...args) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      level,
      category,
      message,
      args,
      timestamp: Date.now(),
      timeFromStart: Date.now() - this.startTime
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift();
    }

    // Persist logs
    if (this.config.persistLogs) {
      this.saveLogs();
    }

    // Console output
    const style = this.getLogStyle(level);
    const time = `+${logEntry.timeFromStart}ms`;

    console.log(
      `%c${category}%c ${time}`,
      style,
      'color: #999; font-size: 10px;',
      message,
      ...args
    );
  }

  /**
   * Check if should log
   */
  shouldLog(level) {
    const configLevel = LogLevel[this.config.logLevel.toUpperCase()];
    const messageLevel = typeof level === 'string' ? LogLevel[level.toUpperCase()] : level;
    return messageLevel >= configLevel;
  }

  /**
   * Get log style
   */
  getLogStyle(level) {
    const styles = {
      [LogLevel.DEBUG]: 'background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      [LogLevel.INFO]: 'background: #10b981; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      [LogLevel.WARN]: 'background: #f59e0b; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
      [LogLevel.ERROR]: 'background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;'
    };
    return styles[level] || styles[LogLevel.DEBUG];
  }

  /**
   * Convenience methods
   */
  debug(category, message, ...args) {
    this.log(LogLevel.DEBUG, category, message, ...args);
  }

  info(category, message, ...args) {
    this.log(LogLevel.INFO, category, message, ...args);
  }

  warn(category, message, ...args) {
    this.log(LogLevel.WARN, category, message, ...args);
  }

  error(category, message, ...args) {
    this.log(LogLevel.ERROR, category, message, ...args);
  }

  /**
   * Performance timing
   */
  time(label) {
    console.time(label);
    this.groups.set(label, Date.now());
  }

  timeEnd(label) {
    console.timeEnd(label);
    const startTime = this.groups.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.info('⏱️ PERF', `${label}: ${duration}ms`);
      this.groups.delete(label);
    }
  }

  /**
   * Load persisted logs
   */
  loadLogs() {
    try {
      const stored = localStorage.getItem('dev_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  /**
   * Save logs
   */
  saveLogs() {
    try {
      localStorage.setItem('dev_logs', JSON.stringify(this.logs.slice(-100)));
    } catch (error) {
      console.warn('Failed to save logs:', error);
    }
  }

  /**
   * Show debug panel
   */
  showDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.innerHTML = `
      <div class="debug-panel-content">
        <div class="debug-panel-header">
          <h3>🔧 Debug Tools</h3>
          <button class="debug-panel-close">×</button>
        </div>

        <div class="debug-panel-tabs">
          <button class="debug-tab active" data-tab="logs">Logs</button>
          <button class="debug-tab" data-tab="network">Network</button>
          <button class="debug-tab" data-tab="performance">Performance</button>
          <button class="debug-tab" data-tab="storage">Storage</button>
        </div>

        <div class="debug-panel-body">
          <div class="debug-tab-content active" data-tab="logs">
            ${this.renderLogsTab()}
          </div>

          <div class="debug-tab-content" data-tab="network">
            ${this.renderNetworkTab()}
          </div>

          <div class="debug-tab-content" data-tab="performance">
            ${this.renderPerformanceTab()}
          </div>

          <div class="debug-tab-content" data-tab="storage">
            ${this.renderStorageTab()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add styles
    this.injectPanelStyles();

    // Add event listeners
    this.attachPanelListeners(panel);
  }

  /**
   * Render logs tab
   */
  renderLogsTab() {
    const recentLogs = this.logs.slice(-50).reverse();

    return `
      <div class="debug-actions">
        <button onclick="console.clear()">Clear Console</button>
        <button onclick="document.getElementById('debug-panel').querySelector('[data-tab=logs]').scrollTop = 0">Scroll to Top</button>
      </div>
      <div class="debug-logs">
        ${recentLogs.map(log => `
          <div class="debug-log-entry debug-log-${Object.keys(LogLevel)[log.level].toLowerCase()}">
            <span class="debug-log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
            <span class="debug-log-category">${log.category}</span>
            <span class="debug-log-message">${log.message}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render network tab
   */
  renderNetworkTab() {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);

    return `
      <div class="debug-stats">
        <div class="debug-stat">
          <span class="debug-stat-label">Total Requests:</span>
          <span class="debug-stat-value">${resources.length}</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">Total Size:</span>
          <span class="debug-stat-value">${(totalSize / 1024).toFixed(2)} KB</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">Total Time:</span>
          <span class="debug-stat-value">${totalTime.toFixed(2)} ms</span>
        </div>
      </div>
      <div class="debug-table">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Size</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${resources.slice(-20).map(r => `
              <tr>
                <td class="debug-cell-truncate">${r.name.split('/').pop()}</td>
                <td>${r.initiatorType}</td>
                <td>${r.transferSize ? (r.transferSize / 1024).toFixed(2) + ' KB' : 'cached'}</td>
                <td>${r.duration.toFixed(2)} ms</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Render performance tab
   */
  renderPerformanceTab() {
    const perfData = performance.getEntriesByType('navigation')[0] || {};

    return `
      <div class="debug-stats">
        <div class="debug-stat">
          <span class="debug-stat-label">DNS Lookup:</span>
          <span class="debug-stat-value">${(perfData.domainLookupEnd - perfData.domainLookupStart || 0).toFixed(2)} ms</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">TCP Connection:</span>
          <span class="debug-stat-value">${(perfData.connectEnd - perfData.connectStart || 0).toFixed(2)} ms</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">TTFB:</span>
          <span class="debug-stat-value">${(perfData.responseStart - perfData.requestStart || 0).toFixed(2)} ms</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">DOM Interactive:</span>
          <span class="debug-stat-value">${(perfData.domInteractive || 0).toFixed(2)} ms</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">DOM Complete:</span>
          <span class="debug-stat-value">${(perfData.domComplete || 0).toFixed(2)} ms</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">Load Complete:</span>
          <span class="debug-stat-value">${(perfData.loadEventEnd || 0).toFixed(2)} ms</span>
        </div>
      </div>

      <div class="debug-actions">
        <button onclick="performance.mark('user-mark'); alert('Performance mark created')">
          Create Performance Mark
        </button>
        <button onclick="console.table(performance.getEntriesByType('measure'))">
          Show Measures
        </button>
      </div>
    `;
  }

  /**
   * Render storage tab
   */
  renderStorageTab() {
    const localStorageSize = new Blob(Object.values(localStorage)).size;
    const sessionStorageSize = new Blob(Object.values(sessionStorage)).size;

    return `
      <div class="debug-stats">
        <div class="debug-stat">
          <span class="debug-stat-label">LocalStorage:</span>
          <span class="debug-stat-value">${Object.keys(localStorage).length} items (${(localStorageSize / 1024).toFixed(2)} KB)</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">SessionStorage:</span>
          <span class="debug-stat-value">${Object.keys(sessionStorage).length} items (${(sessionStorageSize / 1024).toFixed(2)} KB)</span>
        </div>
        <div class="debug-stat">
          <span class="debug-stat-label">Cookies:</span>
          <span class="debug-stat-value">${document.cookie.split(';').filter(c => c.trim()).length} cookies</span>
        </div>
      </div>

      <div class="debug-actions">
        <button onclick="console.table(Object.entries(localStorage))">
          View LocalStorage
        </button>
        <button onclick="console.table(Object.entries(sessionStorage))">
          View SessionStorage
        </button>
        <button onclick="console.log(document.cookie)">
          View Cookies
        </button>
      </div>

      <div class="debug-warning">
        ⚠️ Use browser DevTools Application tab for detailed storage inspection
      </div>
    `;
  }

  /**
   * Attach panel listeners
   */
  attachPanelListeners(panel) {
    // Close button
    panel.querySelector('.debug-panel-close').addEventListener('click', () => {
      panel.remove();
    });

    // Tab switching
    panel.querySelectorAll('.debug-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        // Update active tab
        panel.querySelectorAll('.debug-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active content
        panel.querySelectorAll('.debug-tab-content').forEach(c => c.classList.remove('active'));
        panel.querySelector(`.debug-tab-content[data-tab="${tabName}"]`).classList.add('active');
      });
    });
  }

  /**
   * Inject panel styles
   */
  injectPanelStyles() {
    if (document.getElementById('debug-panel-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'debug-panel-styles';
    style.textContent = `
      #debug-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 400px;
        background: white;
        border-top: 2px solid #667eea;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        z-index: 999998;
        font-family: monospace;
        font-size: 12px;
        display: flex;
        flex-direction: column;
      }

      .debug-panel-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .debug-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .debug-panel-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .debug-panel-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #666;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .debug-panel-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .debug-tab {
        padding: 8px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s;
      }

      .debug-tab:hover {
        color: #333;
        background: #f3f4f6;
      }

      .debug-tab.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }

      .debug-panel-body {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      .debug-tab-content {
        display: none;
        height: 100%;
        overflow-y: auto;
        padding: 16px;
      }

      .debug-tab-content.active {
        display: block;
      }

      .debug-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .debug-stat {
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .debug-stat-label {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
      }

      .debug-stat-value {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .debug-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .debug-actions button {
        padding: 6px 12px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: background 0.2s;
      }

      .debug-actions button:hover {
        background: #5568d3;
      }

      .debug-logs {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow-y: auto;
        max-height: 250px;
      }

      .debug-log-entry {
        padding: 8px 12px;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        gap: 12px;
        font-size: 11px;
      }

      .debug-log-entry:last-child {
        border-bottom: none;
      }

      .debug-log-time {
        color: #999;
        flex-shrink: 0;
      }

      .debug-log-category {
        font-weight: 600;
        flex-shrink: 0;
      }

      .debug-log-message {
        flex: 1;
      }

      .debug-log-debug {
        background: #eff6ff;
      }

      .debug-log-info {
        background: #f0fdf4;
      }

      .debug-log-warn {
        background: #fffbeb;
      }

      .debug-log-error {
        background: #fef2f2;
      }

      .debug-table {
        overflow-x: auto;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }

      .debug-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .debug-table th,
      .debug-table td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #f3f4f6;
      }

      .debug-table th {
        background: #f9fafb;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
      }

      .debug-table td {
        font-size: 11px;
      }

      .debug-cell-truncate {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .debug-warning {
        padding: 12px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: 6px;
        color: #c2410c;
        font-size: 11px;
        margin-top: 16px;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Network Request Monitor
 */
export class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.init();
  }

  /**
   * Initialize network monitoring
   */
  init() {
    this.interceptFetch();
    this.interceptXHR();
  }

  /**
   * Intercept fetch requests
   */
  interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options = {}] = args;

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        this.logRequest({
          type: 'fetch',
          url: url.toString(),
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          duration
        });

        return response;

      } catch (error) {
        const duration = Date.now() - startTime;

        this.logRequest({
          type: 'fetch',
          url: url.toString(),
          method: options.method || 'GET',
          status: 0,
          statusText: 'Network Error',
          duration,
          error: error.message
        });

        throw error;
      }
    };
  }

  /**
   * Intercept XMLHttpRequest
   */
  interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._requestInfo = { method, url, startTime: Date.now() };
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      this.addEventListener('load', () => {
        if (this._requestInfo) {
          const duration = Date.now() - this._requestInfo.startTime;

          networkMonitor.logRequest({
            type: 'xhr',
            url: this._requestInfo.url,
            method: this._requestInfo.method,
            status: this.status,
            statusText: this.statusText,
            duration
          });
        }
      });

      return originalSend.apply(this, arguments);
    };
  }

  /**
   * Log request
   */
  logRequest(request) {
    this.requests.push({
      ...request,
      timestamp: Date.now()
    });

    // Keep only recent requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }

    // Log to console in dev mode
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.showNetwork) {
      const color = request.status >= 200 && request.status < 300 ? '#10b981' : '#ef4444';
      console.log(
        `%c${request.method}%c ${request.url}%c ${request.status} ${request.statusText}%c ${request.duration}ms`,
        `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
        'color: #666;',
        `color: ${color}; font-weight: bold;`,
        'color: #999; font-size: 10px;'
      );
    }
  }

  /**
   * Get all requests
   */
  getRequests() {
    return this.requests;
  }

  /**
   * Clear requests
   */
  clear() {
    this.requests = [];
  }
}

/**
 * Initialize debug tools
 */
export function initDebugTools(config = {}) {
  if (import.meta.env.MODE === 'production') {
    console.log('Debug tools disabled in production');
    return null;
  }

  const devLogger = new DevLogger(config);
  const networkMonitor = new NetworkMonitor();

  // Expose to window for easy access
  window.__DEV__ = {
    logger: devLogger,
    network: networkMonitor,
    logs: () => devLogger.logs,
    requests: () => networkMonitor.getRequests()
  };

  return {
    devLogger,
    networkMonitor
  };
}

// Export singleton instances
export const devLogger = new DevLogger();
export const networkMonitor = new NetworkMonitor();
