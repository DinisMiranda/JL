/**
 * Main Application Entry Point
 * Initializes all features and components
 */

// Import features
import { loadTestimonials } from './features/testimonials.js';
import { loadFAQs } from './features/faq.js';
import { initBookingForm } from './features/booking.js';
import { initNewsletterForm } from './features/newsletter.js';
import { addFloatingSocialSidebar } from './features/social-media.js';
import { loadBlogPosts } from './features/blog.js';
import { loadDocuments } from './features/documents.js';

// Import legal compliance features
import { CookieConsentManager } from './features/cookie-consent.js';
import { initCredentials } from './features/professional-credentials.js';
import { initializeFormCompliance } from './utils/form-compliance.js';

// Import error handling and monitoring
import { initErrorHandler } from './utils/error-handler.js';
import { initPerformanceMonitoring } from './utils/performance-monitor.js';
import { initFeedbackSystem } from './utils/feedback-system.js';
import { initDebugTools } from './utils/debug-tools.js';

/**
 * Initialize application
 */
async function initializeApp() {
  console.log('🚀 Initializing JL Law Firm Website...');

  try {
    // Initialize error handling and monitoring FIRST (critical for catching errors)
    initializeErrorHandling();

    // Initialize legal compliance features (critical for GDPR/RGPD)
    initializeLegalCompliance();

    // Initialize features that exist on the page
    await Promise.all([
      initializeTestimonials(),
      initializeFAQs(),
      initializeBlog(),
      initializeDocuments(),
      initializeBooking(),
      initializeNewsletter(),
      initializeSocialMedia()
    ]);

    console.log('✅ Application initialized successfully');

  } catch (error) {
    console.error('❌ Error initializing application:', error);

    // Show user-friendly error message
    if (window.__ERROR_HANDLER__) {
      window.__ERROR_HANDLER__.globalErrorHandler.handleError({
        type: 'runtime',
        message: 'Failed to initialize application',
        severity: 'high',
        error
      });
    }
  }
}

/**
 * Initialize error handling and monitoring
 */
function initializeErrorHandling() {
  console.log('🛡️ Initializing error handling and monitoring...');

  // Initialize error handler
  const errorHandling = initErrorHandler({
    logToConsole: true,
    logToServer: false, // Enable when backend is ready
    showUserNotifications: true
  });

  // Initialize performance monitoring
  const performanceMonitoring = initPerformanceMonitoring({
    enabled: true,
    logToConsole: true,
    sendToAnalytics: false // Enable when backend is ready
  });

  // Initialize feedback system
  const feedbackSystem = initFeedbackSystem({
    enabled: true,
    showAfterSeconds: 60, // Show satisfaction survey after 1 minute
    showAfterScrollPercent: 75
  });

  // Initialize debug tools (only in development)
  const debugTools = initDebugTools();

  // Expose to window for global access
  window.__ERROR_HANDLER__ = errorHandling;
  window.__PERFORMANCE__ = performanceMonitoring;
  window.__FEEDBACK__ = feedbackSystem;

  if (debugTools) {
    window.__DEBUG__ = debugTools;
  }

  console.log('✅ Error handling and monitoring initialized');
}

/**
 * Initialize legal compliance features (GDPR/RGPD)
 */
function initializeLegalCompliance() {
  console.log('⚖️ Initializing legal compliance features...');

  // 1. Initialize cookie consent (critical - must be first)
  const cookieManager = new CookieConsentManager();
  cookieManager.init();

  // 2. Initialize professional credentials (badges in footer)
  initCredentials();

  // 3. Initialize form compliance (data processing notices)
  initializeFormCompliance();

  // 4. Listen for consent changes
  document.addEventListener('cookieConsentUpdated', (event) => {
    const consent = event.detail;
    console.log('🍪 Cookie consent updated:', consent);

    // Handle Google Analytics consent
    if (consent.analytics && window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      console.log('📊 Google Analytics enabled');
    } else if (window.gtag) {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
      console.log('📊 Google Analytics disabled');
    }

    // Handle marketing/Facebook Pixel consent
    if (consent.marketing && window.fbq) {
      // Initialize Facebook Pixel if needed
      console.log('📱 Marketing cookies enabled');
    }
  });

  console.log('✅ Legal compliance initialized');
}

/**
 * Initialize testimonials
 */
async function initializeTestimonials() {
  const container = document.getElementById('testimonials-section');
  if (container) {
    console.log('📝 Loading testimonials...');
    await loadTestimonials();
  }
}

/**
 * Initialize FAQs
 */
async function initializeFAQs() {
  const container = document.getElementById('faq-section');
  if (container) {
    console.log('❓ Loading FAQs...');
    await loadFAQs();
  }
}

/**
 * Initialize blog
 */
async function initializeBlog() {
  const container = document.getElementById('blog-section');
  if (container) {
    console.log('📰 Loading blog posts...');
    await loadBlogPosts('blog-section', 6); // Load 6 most recent posts
  }
}

/**
 * Initialize documents
 */
async function initializeDocuments() {
  const container = document.getElementById('documents-grid');
  if (container) {
    console.log('📄 Loading documents...');
    await loadDocuments();
  }
}

/**
 * Initialize booking form
 */
function initializeBooking() {
  const form = document.getElementById('booking-form');
  if (form) {
    console.log('📅 Initializing booking form...');
    initBookingForm();
  }
}

/**
 * Initialize newsletter
 */
function initializeNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    console.log('✉️ Initializing newsletter...');
    initNewsletterForm();
  }
}

/**
 * Initialize social media
 */
function initializeSocialMedia() {
  console.log('📱 Initializing social media...');
  // Add floating social sidebar
  addFloatingSocialSidebar();
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }

        // Focus target for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        setTimeout(() => targetElement.removeAttribute('tabindex'), 1000);
      }
    });
  });
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initSmoothScroll();
  });
} else {
  initializeApp();
  initSmoothScroll();
}

/**
 * Export for use in other modules
 */
export default {
  initializeApp,
  initializeErrorHandling,
  initializeLegalCompliance,
  initializeTestimonials,
  initializeFAQs,
  initializeBlog,
  initializeDocuments,
  initializeBooking,
  initializeNewsletter,
  initializeSocialMedia
};
