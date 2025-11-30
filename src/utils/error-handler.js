/**
 * Global Error Handler
 * Comprehensive error handling, logging, and recovery system
 */

/**
 * Error Handler Configuration
 */
const ERROR_CONFIG = {
  logToConsole: true,
  logToServer: import.meta.env.VITE_ENABLE_SERVER_LOGGING === 'true' || false,
  showUserNotifications: true,
  maxRetries: 3,
  retryDelay: 1000,
  serverEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/errors`,
  environment: import.meta.env.MODE || 'production'
};

/**
 * Error types
 */
export const ErrorType = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Global error store
 */
class ErrorStore {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  add(error) {
    this.errors.unshift({
      ...error,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  getAll() {
    return this.errors;
  }

  getRecent(count = 10) {
    return this.errors.slice(0, count);
  }

  clear() {
    this.errors = [];
  }

  generateId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const errorStore = new ErrorStore();

/**
 * Global Error Handler Class
 */
export class GlobalErrorHandler {
  constructor(config = {}) {
    this.config = { ...ERROR_CONFIG, ...config };
    this.listeners = [];
    this.init();
  }

  /**
   * Initialize error handler
   */
  init() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: ErrorType.RUNTIME,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        severity: ErrorSeverity.HIGH
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: ErrorType.RUNTIME,
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        severity: ErrorSeverity.HIGH
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleResourceError(event);
      }
    }, true);

    console.log('✅ Global error handler initialized');
  }

  /**
   * Handle resource loading errors
   */
  handleResourceError(event) {
    const target = event.target;
    const tagName = target.tagName?.toLowerCase();

    if (['img', 'script', 'link', 'video', 'audio'].includes(tagName)) {
      this.handleError({
        type: ErrorType.NOT_FOUND,
        message: `Failed to load ${tagName}: ${target.src || target.href}`,
        resource: target.src || target.href,
        severity: ErrorSeverity.MEDIUM
      });
    }
  }

  /**
   * Main error handling method
   */
  handleError(errorInfo) {
    // Normalize error
    const normalizedError = this.normalizeError(errorInfo);

    // Store error
    errorStore.add(normalizedError);

    // Log error
    if (this.config.logToConsole) {
      this.logToConsole(normalizedError);
    }

    // Send to server
    if (this.config.logToServer) {
      this.logToServer(normalizedError);
    }

    // Show user notification
    if (this.config.showUserNotifications && this.shouldNotifyUser(normalizedError)) {
      this.showUserNotification(normalizedError);
    }

    // Notify listeners
    this.notifyListeners(normalizedError);

    return normalizedError;
  }

  /**
   * Normalize error object
   */
  normalizeError(errorInfo) {
    const {
      type = ErrorType.UNKNOWN,
      message = 'An unknown error occurred',
      severity = ErrorSeverity.MEDIUM,
      error,
      ...rest
    } = errorInfo;

    return {
      type,
      message,
      severity,
      stack: error?.stack || new Error().stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: this.config.environment,
      ...rest
    };
  }

  /**
   * Log error to console
   */
  logToConsole(error) {
    const style = this.getConsoleStyle(error.severity);
    console.group(`%c${error.severity.toUpperCase()} ERROR: ${error.type}`, style);
    console.error('Message:', error.message);
    console.error('Details:', error);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  }

  /**
   * Get console style based on severity
   */
  getConsoleStyle(severity) {
    const styles = {
      [ErrorSeverity.LOW]: 'color: #666; background: #f0f0f0; padding: 2px 5px;',
      [ErrorSeverity.MEDIUM]: 'color: #856404; background: #fff3cd; padding: 2px 5px;',
      [ErrorSeverity.HIGH]: 'color: #721c24; background: #f8d7da; padding: 2px 5px;',
      [ErrorSeverity.CRITICAL]: 'color: #fff; background: #d32f2f; padding: 2px 5px; font-weight: bold;'
    };
    return styles[severity] || styles[ErrorSeverity.MEDIUM];
  }

  /**
   * Log error to server
   */
  async logToServer(error) {
    try {
      await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...error,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Failed to log error to server:', e);
    }
  }

  /**
   * Determine if user should be notified
   */
  shouldNotifyUser(error) {
    // Don't notify for low severity errors
    if (error.severity === ErrorSeverity.LOW) {
      return false;
    }

    // Don't notify for resource loading errors in production
    if (error.type === ErrorType.NOT_FOUND && this.config.environment === 'production') {
      return false;
    }

    return true;
  }

  /**
   * Show user notification
   */
  showUserNotification(error) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');

    const icon = this.getErrorIcon(error.severity);
    const userMessage = this.getUserFriendlyMessage(error);

    notification.innerHTML = `
      <div class="error-notification-content">
        <div class="error-notification-icon">${icon}</div>
        <div class="error-notification-message">
          <strong>${this.getErrorTitle(error.severity)}</strong>
          <p>${userMessage}</p>
        </div>
        <button class="error-notification-close" aria-label="Fechar notificação">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
    `;

    // Add styles
    this.injectNotificationStyles();

    // Add to DOM
    document.body.appendChild(notification);

    // Close button handler
    const closeBtn = notification.querySelector('.error-notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Get error icon
   */
  getErrorIcon(severity) {
    const icons = {
      [ErrorSeverity.LOW]: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 16h-2v-2h2m0-4h-2V6h2m-1-5C6.48 1 1 6.48 1 12s5.48 11 11 11 11-5.48 11-11S17.52 1 12 1z"/></svg>',
      [ErrorSeverity.MEDIUM]: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
      [ErrorSeverity.HIGH]: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      [ErrorSeverity.CRITICAL]: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
    };
    return icons[severity] || icons[ErrorSeverity.MEDIUM];
  }

  /**
   * Get error title
   */
  getErrorTitle(severity) {
    const titles = {
      [ErrorSeverity.LOW]: 'Informação',
      [ErrorSeverity.MEDIUM]: 'Aviso',
      [ErrorSeverity.HIGH]: 'Erro',
      [ErrorSeverity.CRITICAL]: 'Erro Crítico'
    };
    return titles[severity] || 'Erro';
  }

  /**
   * Get user-friendly message
   */
  getUserFriendlyMessage(error) {
    const messages = {
      [ErrorType.NETWORK]: 'Problema de conexão. Por favor, verifique a sua ligação à internet.',
      [ErrorType.VALIDATION]: 'Por favor, verifique os dados inseridos e tente novamente.',
      [ErrorType.PERMISSION]: 'Não tem permissão para realizar esta ação.',
      [ErrorType.NOT_FOUND]: 'O recurso solicitado não foi encontrado.',
      [ErrorType.SERVER]: 'Erro no servidor. Por favor, tente novamente mais tarde.',
      [ErrorType.TIMEOUT]: 'O pedido demorou muito tempo. Por favor, tente novamente.',
      [ErrorType.RUNTIME]: 'Ocorreu um erro inesperado. Por favor, atualize a página.',
      [ErrorType.UNKNOWN]: 'Ocorreu um erro. Por favor, tente novamente.'
    };

    return messages[error.type] || error.message || messages[ErrorType.UNKNOWN];
  }

  /**
   * Inject notification styles
   */
  injectNotificationStyles() {
    if (document.getElementById('error-notification-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'error-notification-styles';
    style.textContent = `
      .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      }

      .error-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
      }

      .error-notification-icon {
        flex-shrink: 0;
        color: #d32f2f;
      }

      .error-notification-message {
        flex: 1;
        min-width: 0;
      }

      .error-notification-message strong {
        display: block;
        color: #1a1a1a;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .error-notification-message p {
        color: #666;
        font-size: 13px;
        line-height: 1.5;
        margin: 0;
      }

      .error-notification-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s;
      }

      .error-notification-close:hover {
        color: #333;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 640px) {
        .error-notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Add error listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove error listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners(error) {
    this.listeners.forEach(callback => {
      try {
        callback(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }
}

/**
 * Network error handler
 */
export class NetworkErrorHandler {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
    this.retryQueue = new Map();
  }

  /**
   * Wrap fetch with error handling
   */
  async fetch(url, options = {}, retryConfig = {}) {
    const {
      maxRetries = ERROR_CONFIG.maxRetries,
      retryDelay = ERROR_CONFIG.retryDelay,
      onRetry
    } = retryConfig;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;

      } catch (error) {
        lastError = error;

        // Check if it's a network error
        const isNetworkError = error.message.includes('Failed to fetch') ||
                               error.message.includes('Network request failed');

        if (attempt < maxRetries && isNetworkError) {
          // Wait before retry
          await this.delay(retryDelay * Math.pow(2, attempt));

          if (onRetry) {
            onRetry(attempt + 1, maxRetries);
          }

          continue;
        }

        // Log error
        this.errorHandler.handleError({
          type: isNetworkError ? ErrorType.NETWORK : ErrorType.SERVER,
          message: error.message,
          url,
          method: options.method || 'GET',
          attempt: attempt + 1,
          maxRetries,
          severity: ErrorSeverity.HIGH,
          error
        });

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check network status
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Monitor network status
   */
  monitorNetworkStatus() {
    window.addEventListener('online', () => {
      console.log('✅ Network connection restored');
      this.showNetworkNotification('Conexão restaurada', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('❌ Network connection lost');
      this.showNetworkNotification('Sem conexão à internet', 'error');
    });
  }

  /**
   * Show network notification
   */
  showNetworkNotification(message, type) {
    // Use error handler's notification system
    if (type === 'error') {
      this.errorHandler.handleError({
        type: ErrorType.NETWORK,
        message,
        severity: ErrorSeverity.HIGH
      });
    }
  }
}

/**
 * Form error handler
 */
export class FormErrorHandler {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Handle form submission with error recovery
   */
  async handleSubmit(form, submitHandler) {
    try {
      // Validate form
      if (!form.checkValidity()) {
        this.showValidationErrors(form);
        return false;
      }

      // Show loading state
      this.setFormLoading(form, true);

      // Submit
      const result = await submitHandler();

      // Success
      this.setFormLoading(form, false);
      this.showSuccessMessage(form);

      return result;

    } catch (error) {
      // Error
      this.setFormLoading(form, false);

      this.errorHandler.handleError({
        type: ErrorType.VALIDATION,
        message: error.message,
        formId: form.id,
        severity: ErrorSeverity.MEDIUM,
        error
      });

      this.showFormError(form, error.message);

      return false;
    }
  }

  /**
   * Show validation errors
   */
  showValidationErrors(form) {
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
      firstInvalid.focus();
      this.showFieldError(firstInvalid);
    }
  }

  /**
   * Show field error
   */
  showFieldError(field) {
    const errorMessage = field.validationMessage || 'Campo inválido';
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');

    // Remove existing error
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) {
      existing.remove();
    }

    field.parentElement.appendChild(errorElement);
    field.classList.add('error');
  }

  /**
   * Show form error
   */
  showFormError(form, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;

    // Remove existing error
    const existing = form.querySelector('.form-error');
    if (existing) {
      existing.remove();
    }

    form.insertBefore(errorElement, form.firstChild);
  }

  /**
   * Show success message
   */
  showSuccessMessage(form) {
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.setAttribute('role', 'status');
    successElement.textContent = 'Enviado com sucesso!';

    form.insertBefore(successElement, form.firstChild);

    setTimeout(() => successElement.remove(), 5000);
  }

  /**
   * Set form loading state
   */
  setFormLoading(form, loading) {
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = loading;
      submitButton.textContent = loading ? 'A enviar...' : 'Enviar';
    }

    form.classList.toggle('loading', loading);
  }
}

/**
 * Initialize global error handler
 */
export function initErrorHandler(config = {}) {
  const globalErrorHandler = new GlobalErrorHandler(config);
  const networkErrorHandler = new NetworkErrorHandler(globalErrorHandler);
  const formErrorHandler = new FormErrorHandler(globalErrorHandler);

  // Monitor network status
  networkErrorHandler.monitorNetworkStatus();

  return {
    globalErrorHandler,
    networkErrorHandler,
    formErrorHandler,
    errorStore
  };
}

// Export singleton instance
export const errorHandler = new GlobalErrorHandler();
export const networkHandler = new NetworkErrorHandler(errorHandler);
export const formHandler = new FormErrorHandler(errorHandler);
