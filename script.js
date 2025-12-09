// ========================================
// ACCESSIBILITY: Keyboard Navigation Detection
// ========================================
let isUsingKeyboard = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    isUsingKeyboard = true;
    document.body.classList.add('user-is-tabbing');
  }
});

document.addEventListener('mousedown', () => {
  isUsingKeyboard = false;
  document.body.classList.remove('user-is-tabbing');
});

// ========================================
// ACCESSIBILITY: Screen Reader Announcements
// ========================================
function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ========================================
// JavaScript para Menu Mobile (Enhanced for Accessibility & Touch)
// ========================================
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuButton && mobileNav) {
  // Function to toggle menu
  const toggleMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isCurrentlyHidden = mobileNav.classList.contains('hidden');
    
    if (isCurrentlyHidden) {
      // Open menu
      mobileNav.classList.remove('hidden');
      mobileMenuButton.classList.add('active');
      mobileMenuButton.setAttribute('aria-expanded', 'true');
      mobileMenuButton.setAttribute('aria-label', 'Fechar menu de navegação');
      announceToScreenReader('Menu aberto');
      
      // Don't auto-focus first link to avoid permanent active state
    } else {
      // Close menu
      mobileNav.classList.add('hidden');
      mobileMenuButton.classList.remove('active');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Abrir menu de navegação');
      announceToScreenReader('Menu fechado');
    }
  };

  // Add multiple event listeners for better mobile support
  mobileMenuButton.addEventListener('click', toggleMenu);
  mobileMenuButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleMenu(e);
  });

  // Close mobile menu when clicking on a link
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.add('hidden');
      mobileMenuButton.classList.remove('active');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Abrir menu de navegação');
      announceToScreenReader('Menu fechado');
    });
  });

  // Close menu with Escape key
  mobileNav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      mobileNav.classList.add('hidden');
      mobileMenuButton.classList.remove('active');
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      mobileMenuButton.setAttribute('aria-label', 'Abrir menu de navegação');
      mobileMenuButton.focus();
      announceToScreenReader('Menu fechado');
    }
  });
}

// ========================================
// MOBILE: Swipe Gestures for Menu
// ========================================
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const minSwipeDistance = 50;

function handleSwipeGesture() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Check if horizontal swipe is more significant than vertical
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Swipe right to open menu (from left edge)
    if (diffX > minSwipeDistance && touchStartX < 50) {
      if (mobileNav && mobileNav.classList.contains('hidden')) {
        mobileMenuButton.click();
      }
    }
    // Swipe left to close menu
    else if (diffX < -minSwipeDistance) {
      if (mobileNav && !mobileNav.classList.contains('hidden')) {
        mobileMenuButton.click();
      }
    }
  }
}

// Add touch event listeners for swipe gestures
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeGesture();
}, { passive: true });

// ========================================
// MOBILE: Pull-to-Refresh Indicator
// ========================================
let touchStartYPosition = 0;
let isPulling = false;

function createPullToRefreshIndicator() {
  if (document.getElementById('pull-to-refresh-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'pull-to-refresh-indicator';
  indicator.className = 'pull-to-refresh';
  indicator.textContent = '↓ Puxe para atualizar';
  document.body.appendChild(indicator);
  return indicator;
}

// Only enable pull-to-refresh on mobile devices
if ('ontouchstart' in window) {
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      touchStartYPosition = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;

    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartYPosition;

    if (pullDistance > 80 && window.scrollY === 0) {
      const indicator = createPullToRefreshIndicator();
      indicator.classList.add('active');
      indicator.textContent = '↻ Solte para atualizar';
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isPulling) return;

    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator && indicator.classList.contains('active')) {
      indicator.textContent = '⟳ Atualizando...';

      // Simulate refresh (reload page after short delay)
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }

    isPulling = false;

    // Hide indicator after delay
    if (indicator) {
      setTimeout(() => {
        indicator.classList.remove('active');
      }, 1000);
    }
  }, { passive: true });
}

// ========================================
// MOBILE: Smooth Scroll Enhancement
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();

      // Close mobile menu if open
      if (mobileNav && !mobileNav.classList.contains('hidden')) {
        mobileMenuButton.click();
      }

      // Smooth scroll with offset for sticky header
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without jumping
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

// ========================================
// MOBILE: Viewport Height Fix (iOS Safari)
// ========================================
function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial value
setVH();

// Update on resize and orientation change
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', () => {
  setTimeout(setVH, 100);
});

// ========================================
// MOBILE: Performance Monitoring
// ========================================
if ('performance' in window && 'PerformanceObserver' in window) {
  // Monitor First Contentful Paint
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('FCP:', entry.startTime);
        trackFormEvent('performance_fcp', { time: entry.startTime });
      }
    }
  });

  try {
    perfObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    console.log('Performance monitoring not supported');
  }
}

// ========================================
// JavaScript para Formulário de Contacto (Enhanced for Accessibility & Security)
// ========================================
const form = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const submitSpinner = document.getElementById('submit-spinner');

// ========================================
// INPUT SANITIZATION
// ========================================
function sanitizeInput(input) {
  // Remove potentially dangerous characters and scripts
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return input.replace(reg, (match) => map[match]);
}

function sanitizeEmail(email) {
  // Basic email sanitization
  return email.trim().toLowerCase();
}

// ========================================
// RATE LIMITING
// ========================================
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'form_submissions'
};

function getRateLimitData() {
  const stored = localStorage.getItem(RATE_LIMIT.storageKey);
  if (!stored) return { attempts: [], blocked: false };

  const data = JSON.parse(stored);
  const now = Date.now();

  // Filter out old attempts
  data.attempts = data.attempts.filter(
    timestamp => now - timestamp < RATE_LIMIT.windowMs
  );

  return data;
}

function checkRateLimit() {
  const data = getRateLimitData();

  if (data.blocked && Date.now() - data.blockedUntil < 0) {
    const minutesLeft = Math.ceil((data.blockedUntil - Date.now()) / 60000);
    return {
      allowed: false,
      message: `Demasiadas tentativas. Por favor, aguarde ${minutesLeft} minutos.`
    };
  }

  if (data.attempts.length >= RATE_LIMIT.maxAttempts) {
    const oldestAttempt = Math.min(...data.attempts);
    const timeToWait = RATE_LIMIT.windowMs - (Date.now() - oldestAttempt);
    const minutesLeft = Math.ceil(timeToWait / 60000);

    // Block for remaining time
    localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify({
      attempts: data.attempts,
      blocked: true,
      blockedUntil: Date.now() + timeToWait
    }));

    return {
      allowed: false,
      message: `Limite de envios atingido. Por favor, aguarde ${minutesLeft} minutos.`
    };
  }

  return { allowed: true };
}

function recordSubmission() {
  const data = getRateLimitData();
  data.attempts.push(Date.now());
  localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify(data));
}

// ========================================
// HONEYPOT SPAM PROTECTION
// ========================================
function checkHoneypot() {
  const honeypot = document.getElementById('website');
  if (honeypot && honeypot.value !== '') {
    console.warn('Honeypot triggered - potential spam detected');
    return false;
  }
  return true;
}

// ========================================
// CHARACTER COUNTER
// ========================================
function setupCharacterCounter() {
  const textarea = document.getElementById('mensagem');
  const currentCounter = document.getElementById('mensagem-current');
  const maxCounter = document.getElementById('mensagem-max');

  if (!textarea || !currentCounter) return;

  const maxLength = parseInt(textarea.getAttribute('maxlength')) || 1000;
  maxCounter.textContent = maxLength;

  textarea.addEventListener('input', () => {
    const currentLength = textarea.value.length;
    currentCounter.textContent = currentLength;

    // Visual feedback when approaching limit
    if (currentLength > maxLength * 0.9) {
      currentCounter.classList.add('text-orange-600', 'font-semibold');
    } else {
      currentCounter.classList.remove('text-orange-600', 'font-semibold');
    }

    if (currentLength === maxLength) {
      currentCounter.classList.add('text-red-600', 'font-bold');
      currentCounter.classList.remove('text-orange-600');
    }
  });
}

// ========================================
// ENHANCED VALIDATION
// ========================================
function validateField(fieldId, errorId, validationFn, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(errorId);

  if (!validationFn(field.value)) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('border-red-500');
    field.classList.remove('border-gray-300');
    errorSpan.textContent = errorMessage;
    errorSpan.classList.remove('hidden');
    return false;
  } else {
    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('border-red-500');
    field.classList.add('border-gray-300');
    errorSpan.textContent = '';
    errorSpan.classList.add('hidden');
    return true;
  }
}

function clearFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(errorId);
  field.setAttribute('aria-invalid', 'false');
  field.classList.remove('border-red-500');
  field.classList.add('border-gray-300');
  errorSpan.textContent = '';
  errorSpan.classList.add('hidden');
}

// Advanced email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;

  // Check for common typos in domain
  const domain = email.split('@')[1];
  if (!domain) return false;

  // Block disposable email domains (basic list)
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (disposableDomains.some(d => domain.includes(d))) {
    return false;
  }

  return true;
}

// ========================================
// VISUAL FEEDBACK HELPERS
// ========================================
function showLoading() {
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  submitText.textContent = 'A enviar...';
  submitSpinner.classList.remove('hidden');
  submitBtn.classList.add('opacity-75');
}

function hideLoading() {
  submitBtn.disabled = false;
  submitBtn.removeAttribute('aria-busy');
  submitText.textContent = 'Enviar';
  submitSpinner.classList.add('hidden');
  submitBtn.classList.remove('opacity-75');
}

function showFormMessage(message, type = 'success') {
  formMessage.classList.remove('hidden');
  formMessage.setAttribute('tabindex', '0');

  if (type === 'success') {
    formMessage.className = 'p-4 rounded-lg mb-4 bg-green-100 text-green-800 border border-green-400 flex items-start gap-3';
    formMessage.innerHTML = `
      <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
  } else if (type === 'error') {
    formMessage.className = 'p-4 rounded-lg mb-4 bg-red-100 text-red-800 border border-red-400 flex items-start gap-3';
    formMessage.innerHTML = `
      <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
  } else if (type === 'warning') {
    formMessage.className = 'p-4 rounded-lg mb-4 bg-yellow-100 text-yellow-800 border border-yellow-400 flex items-start gap-3';
    formMessage.innerHTML = `
      <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
    `;
  }

  // Focus and announce
  formMessage.focus();
  announceToScreenReader(message, 'assertive');
}

// ========================================
// ANALYTICS TRACKING
// ========================================
function trackFormEvent(eventName, data = {}) {
  try {
    // Google Analytics 4 (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }

    // Console log for debugging
    console.log('Form Event:', eventName, data);

    // Could also send to custom analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event: eventName, data }) });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

// ========================================
// FORM INITIALIZATION AND HANDLING
// ========================================
if (form && formMessage && submitBtn) {
  // Initialize character counter
  setupCharacterCounter();

  // Real-time validation on blur
  const fields = [
    { id: 'nome', errorId: 'nome-error', validate: (val) => val.trim().length >= 2 && val.trim().length <= 100, message: 'Por favor, insira um nome válido (2-100 caracteres)' },
    { id: 'email', errorId: 'email-error', validate: isValidEmail, message: 'Por favor, insira um email válido' },
    { id: 'assunto', errorId: 'assunto-error', validate: (val) => val.trim().length >= 5 && val.trim().length <= 200, message: 'Por favor, insira um assunto válido (5-200 caracteres)' },
    { id: 'mensagem', errorId: 'mensagem-error', validate: (val) => val.trim().length >= 10 && val.trim().length <= 1000, message: 'Por favor, insira uma mensagem (10-1000 caracteres)' }
  ];

  fields.forEach(({ id, errorId, validate, message }) => {
    const field = document.getElementById(id);

    // Validate on blur
    field.addEventListener('blur', () => {
      if (field.value.trim()) {
        validateField(id, errorId, validate, message);
      }
    });

    // Clear error on input
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        clearFieldError(id, errorId);
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Track form submission attempt
    trackFormEvent('form_submit_attempt');

    // Check honeypot
    if (!checkHoneypot()) {
      trackFormEvent('form_spam_detected', { method: 'honeypot' });
      // Silently fail for bots
      showFormMessage('Erro ao enviar mensagem. Por favor, tente novamente.', 'error');
      return;
    }

    // Check rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      trackFormEvent('form_rate_limited');
      showFormMessage(rateCheck.message, 'warning');
      announceToScreenReader(rateCheck.message, 'assertive');
      return;
    }

    // Validate all fields
    let isValid = true;
    fields.forEach(({ id, errorId, validate, message }) => {
      if (!validateField(id, errorId, validate, message)) {
        isValid = false;
      }
    });

    if (!isValid) {
      trackFormEvent('form_validation_failed');
      announceToScreenReader('Por favor, corrija os erros no formulário', 'assertive');
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    // Show loading state
    showLoading();
    announceToScreenReader('A enviar mensagem', 'polite');
    formMessage.classList.add('hidden');

    // Sanitize and collect form data
    const formData = {
      nome: sanitizeInput(document.getElementById('nome').value.trim()),
      email: sanitizeEmail(document.getElementById('email').value),
      assunto: sanitizeInput(document.getElementById('assunto').value.trim()),
      mensagem: sanitizeInput(document.getElementById('mensagem').value.trim())
    };

    try {
      const emailDestino = 'joaojlobo@hotmail.com';

      // Attempt to send email
      await sendEmail(formData, emailDestino);

      // Record successful submission for rate limiting
      recordSubmission();

      // Track success
      trackFormEvent('form_submit_success', {
        nome_length: formData.nome.length,
        mensagem_length: formData.mensagem.length
      });

      // Show success message
      showFormMessage('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success');

      // Clear form
      form.reset();
      fields.forEach(({ id, errorId }) => clearFieldError(id, errorId));

      // Reset character counter
      if (document.getElementById('mensagem-current')) {
        document.getElementById('mensagem-current').textContent = '0';
      }

    } catch (error) {
      // Track error
      trackFormEvent('form_submit_error', {
        error_message: error.message
      });

      // Show error message
      const errorMsg = error.message || 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.';
      showFormMessage(errorMsg, 'error');
      console.error('Erro ao enviar email:', error);

    } finally {
      hideLoading();
    }
  });
}

// ========================================
// EmailJS Integration with Enhanced Error Handling
// ========================================

// Configuration
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_7qyix2h',
  TEMPLATE_ID: 'out15ba',
  PUBLIC_KEY: 'mnMtNP24K1Fi5ZIC6',
  MAX_RETRIES: 2,
  RETRY_DELAY: 2000, // 2 seconds
  TIMEOUT: 10000 // 10 seconds
};

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = EMAIL_CONFIG.MAX_RETRIES) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;

      const delay = EMAIL_CONFIG.RETRY_DELAY * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Mailto fallback function
function openMailtoFallback(data, toEmail) {
  const subject = encodeURIComponent(`Contacto do site: ${data.assunto}`);
  const body = encodeURIComponent(
    `Nome: ${data.nome}\nEmail: ${data.email}\n\nMensagem:\n${data.mensagem}\n\n---\nEnviado através do formulário de contacto`
  );
  window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
}

// Main email sending function
async function sendEmail(data, toEmail) {
  // Validate EmailJS configuration
  if (!EMAIL_CONFIG.PUBLIC_KEY || EMAIL_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('EmailJS not configured, falling back to mailto');
    openMailtoFallback(data, toEmail);
    throw new Error('EmailJS não está configurado. O seu cliente de email foi aberto.');
  }

  // Check if EmailJS library is loaded
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS library not loaded');
    trackFormEvent('emailjs_library_missing');
    openMailtoFallback(data, toEmail);
    throw new Error('Serviço de email temporariamente indisponível. O seu cliente de email foi aberto.');
  }

  try {
    // Initialize EmailJS
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

    // Prepare template parameters
    const templateParams = {
      from_name: data.nome,
      from_email: data.email,
      subject: data.assunto,
      message: data.mensagem,
      reply_to: data.email,
      to_email: toEmail,
      timestamp: new Date().toISOString()
    };

    // Send with retry logic and timeout
    const result = await Promise.race([
      retryWithBackoff(async () => {
        return await emailjs.send(
          EMAIL_CONFIG.SERVICE_ID,
          EMAIL_CONFIG.TEMPLATE_ID,
          templateParams
        );
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), EMAIL_CONFIG.TIMEOUT)
      )
    ]);

    // Track success
    trackFormEvent('emailjs_send_success', {
      status: result.status,
      text: result.text
    });

    return { success: true, result };

  } catch (error) {
    console.error('EmailJS error:', error);

    // Track specific error types
    if (error.message === 'Timeout') {
      trackFormEvent('emailjs_timeout');
    } else if (error.status) {
      trackFormEvent('emailjs_error', {
        status: error.status,
        text: error.text
      });
    } else {
      trackFormEvent('emailjs_unknown_error', {
        message: error.message
      });
    }

    // Determine error message
    let errorMessage = 'Erro ao enviar mensagem. ';

    if (error.message === 'Timeout') {
      errorMessage += 'O serviço demorou demasiado a responder. ';
    } else if (error.status === 400) {
      errorMessage += 'Dados inválidos. ';
    } else if (error.status === 403) {
      errorMessage += 'Acesso negado. ';
    } else if (error.status === 429) {
      errorMessage += 'Demasiadas tentativas. ';
    } else if (error.status >= 500) {
      errorMessage += 'Problema no servidor. ';
    }

    // Offer mailto fallback
    const useMailto = confirm(
      errorMessage + 'Deseja abrir o seu cliente de email como alternativa?'
    );

    if (useMailto) {
      openMailtoFallback(data, toEmail);
      trackFormEvent('mailto_fallback_used');
      throw new Error('O seu cliente de email foi aberto. Por favor, envie a mensagem manualmente.');
    }

    throw new Error(errorMessage + 'Por favor, tente novamente mais tarde.');
  }
}

// ========================================
// EmailJS Configuration Validator (Run on page load)
// ========================================
function validateEmailJSConfig() {
  if (typeof emailjs === 'undefined') {
    console.warn('⚠️ EmailJS library not loaded. Form will fallback to mailto.');
    return false;
  }

  if (!EMAIL_CONFIG.PUBLIC_KEY || EMAIL_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    console.warn('⚠️ EmailJS not configured. Please set up EmailJS credentials.');
    return false;
  }

  console.log('✓ EmailJS configured and ready');
  return true;
}

// Run validation on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateEmailJSConfig);
  } else {
    validateEmailJSConfig();
  }
}

// Funções para Modal de Artigos
const articles = {
  artigo1: {
    title: 'Breve contributo para o aperfeiçoamento da social-democracia',
    author: 'Por João Lobo',
    content: `
      <blockquote class="border-l-4 border-secondary pl-4 italic text-primary mb-6 text-lg">
        "Todos os dias ao acordar, duas coisas me deixam maravilhado, o céu estrelado acima de mim e a lei moral dentro de mim" - KANT.
      </blockquote>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        "Também eu, me apercebo de uma realidade que está acima de mim, e outra que está "abaixo" de mim. Sou eu, quem, todos dias, ao acordar de manhã cedo, decido qual das duas deve prevalecer: o mundo das coisas concretas, ou o mundo da razão ética e moral no intercâmbio das existências.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Essa escolha pertence a todos nós que a fazemos diariamente. Essa realidade, íntima, unipessoal, incindível e intransmissível, repercute a pessoa que somos. A realidade que se mostra visível, o mundo concreto, e a realidade que está acima de nós, a realidade dos valores, a realidade não escrita, congénita, um dado natural, possível de apreensão e de explicitação e de realização na ordem concreta. Sendo um dado imediato de natureza espiritual apreensível por qualquer um não são muitos os que a conseguem "observar" e a ela se vincular. Aqueles que a conseguem "ver", rezam as lendas, tornam-se "imortais", imortais, porque infelizmente, e cada vez mais, encontramo-nos numa sociedade onde a palavra de hoje não é a palavra de amanhã, onde a responsabilização política (entre outras) cada vez mais desnorteada e sem ética, foi saqueada pelos "senhores" da democracia, das ideias e das palavras, por conseguinte dos chavões próprios do discurso demagógico. Nunca a palavra valeu tão pouco, nunca se viu tal banalização de pessoas e partidos. Assistimos a uma demagogia no grau mais elevado, cansada e sem utilidade concreta no beneficio social comum, salvo para aqueles que ardilosamente a usam.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        A "imortalização" das pessoas não passa por nada divino ou por uma qualquer realidade heróica que nos possam ter ensinado na escola; passa, sim, pela vivência diária e constante, e pelo abdicar daquilo que muitas vezes acreditamos e julgamos verdadeiro mas que descompaginado daquele núcleo fundante da sociedade o não é. Hoje, assistimos a uma desconsideração daqueles valores fundantes e à sua anulação pelo totalitarismo pragmático e pela vazio dos valores e ideais que promovem o confraterno, o solidário e o socialmente justo. O estado, por mais bem regido que seja e por mais poderes de que disponha nunca poderá substituir-se à riqueza transcendente da consciência e da razão moral humana.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Rawls, um dos principais filósofos do século XX, ilumina-nos com o aprofundar do conceito de "justiça social". Uma das suas principais afirmações debruça-se sobre a necessidade de todos os cidadãos serem iguais perante a lei e no modo concreto ser e de estar. Mas será a lei e tudo o que está subjacente a isso, igual perante os nossos olhos?
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Como social-democrata, a minha autodeterminação enquanto ser humano obriga-me a questionar estes aspetos; a definir as bases do enquadramento numa sociedade que reclama a liberdade de pensamento, a liberdade de ação e a capacidade de nos gerir o bem comum, sempre em obediência a padrões éticos e morais, a conceitos abertos, a vinculações de pensamento e de ação que tem as suas raízes orientadoras no "dentro de mim" para uma sociedade fora de mim. Estaremos a atravessar uma crise de valores, ou a políticas atualmente ter-se-á transformado numa realidade distinta de tudo isto. Trata-se de situação que merece funda reflexão. Qual o plano que me quero colocar? Não deverão ser os nossos pensamentos e reflexões a base de tudo o que fazemos, devendo estas mostrar-se flexíveis e de acordo com as circunstancias, os tempos e a nossas vinculações pessoais, em contra ponto à ordem real que é cega e muda se não for intermediada pela ação humana?
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Fazendo um exercício intelectual e colocando-nos sob o "véu da ignorância", despidos de preconceitos, das ideias já estabelecidas, e esquecendo o que nos foi ensinado na escola, invocando Bernstein, também a mim se me afigura que à Social-democracia compete-lhe, o que sempre lhe foi pedido, a manutenção de uma ordem social, refletida, pensada e acima de tudo onde o "eu" não se sobreponha à realidade que teima em nos querer fugir. Não será a "revolução", agora mais de consciências e comportamentos e menos de apropriação coletiva e estatal dos meios materiais de produção - que outros apregoam, dotados de uma sabedoria manhosa, quase animalesca e irresponsável uma falsa revolução? Sê-lo-á sempre desde que, a mesma não se funde nem respeite no catálogo de concreta realização dos direitos Humanos. A Historia de todos os excessos e de todos os "ismos" comprova-o. Eu prefiro a evolução dos conceitos e a sua gradual adaptação à vida concreta. Não nos podemos transformar num ser meramente de ações ou ficções; não podemos ser fruto do que vemos, nem tão pouco podemos subjugar a nossa liberdade à totalidade um bem sistema de produção e distribuição económica, mas sim agir autonomamente nas nossas ações, iluminados pelos padrões em que historicamente a Social-democracia se reconheceu e em permanente revisitação e densificação.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Em síntese: A sociedade atual hiper-complexa e atravessada por um tempo de rápidas transformações exige uma tensão dialética entre as suas formas regulatórias e, a realidade material sobre a qual aquelas incidem. As formas de regulação não podem prescindir de uma conceção da pessoa humana que num primeiro tempo se assuma como entidade autónoma daquela realidade mas que, num segundo tempo, nesta se inscreva, procurando que a ordem social se oriente, de acordo com aqueles valores que se explicitam na autonomia ética e na consciência jurídica. Numa sociedade aberta, o acervo de valores que a orientam, regulam, e projectam no futuro, reclama-se que ocorra, uma intermediação entre os dois planos, de forma a que as exigências do Humano, no plano da igualdade e da dignidade, sejam cumpridas no mais alto grau. Este exercício que deve orientar os órgãos de regulação da sociedade, individuais ou coletivos, reclama insistentemente a convocação daqueles valores morais e éticos mas em simultâneo, na sua aplicação concreta, uma ponderação e uma explicitação mediadas pela razão e pelo bom senso."
      </p>
      
      <p class="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
        Fonte: orossio.pt
      </p>
    `
  },
  artigo2: {
    title: 'Ao meu Dr. Carlos Pires',
    author: 'Por João Lobo',
    content: `
      <p class="text-gray-700 leading-relaxed mb-4">
        Ingressei recentemente na Ordem dos Advogados e não podia deixar de fazer uma reflexão sobre o meu antigo e eterno Patrono, Dr. Carlos Pires, que o próprio destino me fez.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Lembro-me, após o falecimento do meu pai, João Lobo, advogado de profissão, que o mundo se tornou e o escritório necessitava de uma pessoa urgente de me dar apoio.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        O direito e a justiça não esperam por nós advogados, nem pelos clientes desavisados. Já dizia Kafka, no livro "O Processo", "terra para os direitos", quer o Direito "é um dever ser que não é".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Se é certo que os dias e as semanas nos vivenciam com grande ansiedade e incerteza, na minha parte, a verdade depois mostrou-se, porém resiliente, forte e determinada.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Foi, nesta que o Dr. Carlos Pires me convidou para ingressar no seu escritório na qualidade de advogado estagiário.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Desde o primeiro dia que entrei no seu escritório foi de entrega plena (que por casualidade permite os seus pares), pela sua dedicação incansável à causa, ao cliente, aos diferentes assuntos: jurídicas e pode-se considerar nas suas áreas, como um verdadeiro "sábio sobre Direito e a sua prática à semelhança de outros saudosos tempos".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        No discurso do meu estágio assisti a diversos actos, próprios da profissão de advogado, de direito e direitos de escrivão, tendo a oportunidade de acompanhar o meu antigo Patrono, Dr. Carlos Pires, quer da Ilustre Teresa Pires, da Dra. Madalena Nascimento e da Dra. Cristina Lemos, Advogados de confiança do meu patrono, bem como a oportunidade de colaborar com o meu Patrono na redação de requerimentos e diversas peças processuais, tendo ainda assistido a diversas consultas com clientes e a diversas reuniões, podendo, ademais, diversos cursos de formação organizados pela Ordem dos Advogados e Associação Jurídica de Braga, adotando importantes doutrinas mais, diversas das considerações, tendo, de igual forma, acompanhamento, não só do advogado, mas a "pessoa" do advogado.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        O advogado é, de raciocínio e técnica, a sagacidade, a resiliência, mas estas e outras qualidades não bastam. Por me lado, a complexidade de receber o treinamento sob a tutela do Dr. Carlos Pires não apenas contribui para o meu entendimento sobre o que significa ser advogado, mas também as diferentes dimensões que esta realidade é completa.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Por tudo o que somos nos mais pequenos actos.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Sou um testemunho real da "pessoa" recta, leal, transparente e amiga. A sua busca com compreensão pelos clientes é um testemunho da sua dedicação em não só compreender as nuances legais, mas também as preocupações humanas profundas que estão em cada caso.
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Não raras as vezes, o meu pai costumava dizer-me: "João, o pré-habitual, depois, todos os dias, perante cada um de nós", o mesmo quer dizer que encontra, em todas as letras pessoas, tendo no princípio a partida e poesia auto-determinação, em escolher, em que idade da história queremos permanecer. Como certa Shakespeare, no Hamlet: "to be, or not to be", that's the question".
      </p>
      
      <p class="text-gray-700 leading-relaxed mb-4">
        Obrigado pelo seu tempo, pela sua fineza de espírito e por compartilhar o seu valioso conhecimento. Tenho a certeza que modelou, como irá modelar, o meu iter para eu também me tornar um advogado exemplar.
      </p>
      
      <p class="text-gray-600 text-sm mt-8 pt-4 border-t border-gray-200">
        Publicado originalmente no jornal Correio do Minho, 16 de Setembro de 2023
      </p>
    `
  }
};

// ========================================
// Modal Functions (Enhanced for Accessibility)
// ========================================
let lastFocusedElement = null;
let focusableElements = [];
let firstFocusableElement = null;
let lastFocusableElement = null;

function openArticle(articleId) {
  const article = articles[articleId];
  if (!article) return;

  // Save currently focused element
  lastFocusedElement = document.activeElement;

  const modal = document.getElementById('article-modal');
  const content = document.getElementById('article-content');

  content.innerHTML = `
    <h3 class="text-2xl md:text-3xl font-serif font-semibold text-primary mb-3">${article.title}</h3>
    <p class="text-gray-600 italic mb-6">${article.author}</p>
    ${article.content}
    <div class="mt-8 pt-4 border-t border-gray-200">
      <button onclick="closeArticle()" class="bg-secondary hover:bg-secondary/90 focus:bg-secondary/90 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-secondary/50 min-h-[44px]" aria-label="Fechar artigo e voltar às publicações">
        Voltar às Publicações
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Get all focusable elements within modal
  focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusableElement = focusableElements[0];
  lastFocusableElement = focusableElements[focusableElements.length - 1];

  // Focus first focusable element (close button)
  setTimeout(() => {
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  }, 100);

  // Announce to screen readers
  announceToScreenReader(`Artigo aberto: ${article.title}`, 'polite');
}

function closeArticle() {
  const modal = document.getElementById('article-modal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Return focus to element that opened modal
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }

  // Announce to screen readers
  announceToScreenReader('Artigo fechado', 'polite');
}

function closeArticleOnBackdrop(event) {
  if (event.target.id === 'article-modal') {
    closeArticle();
  }
}

// ========================================
// Modal Keyboard Navigation and Focus Trap
// ========================================
document.addEventListener('keydown', function (event) {
  const modal = document.getElementById('article-modal');
  const isModalOpen = !modal.classList.contains('hidden');

  // Close modal with ESC
  if (event.key === 'Escape' && isModalOpen) {
    closeArticle();
    return;
  }

  // Focus trap
  if (event.key === 'Tab' && isModalOpen) {
    if (focusableElements.length === 0) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }
  }
});

