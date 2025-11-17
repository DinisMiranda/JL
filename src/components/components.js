/**
 * Reusable Component Library
 * Modern, accessible, and responsive UI components
 */

// ========================================
// CARD COMPONENTS
// ========================================

/**
 * Create a card component
 * @param {Object} options - Card configuration
 * @returns {HTMLElement} - Card element
 */
export function createCard({
  title,
  subtitle,
  content,
  image,
  imageAlt = '',
  link,
  linkText = 'Ler mais',
  className = '',
  badge,
  footer
}) {
  const card = document.createElement('article');
  card.className = `card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/50 overflow-hidden transform hover:-translate-y-1 ${className}`;

  let html = '';

  // Image
  if (image) {
    html += `
      <div class="card-image aspect-video overflow-hidden">
        <img
          src="${image}"
          alt="${imageAlt}"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    `;
  }

  // Content
  html += '<div class="card-content p-6">';

  // Badge
  if (badge) {
    html += `
      <span class="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full mb-3">
        ${badge}
      </span>
    `;
  }

  // Title
  if (title) {
    html += `<h3 class="card-title text-xl font-serif font-semibold text-gray-900 mb-2">${title}</h3>`;
  }

  // Subtitle
  if (subtitle) {
    html += `<p class="card-subtitle text-sm text-gray-600 mb-3">${subtitle}</p>`;
  }

  // Content
  if (content) {
    html += `<div class="card-body text-gray-700 leading-relaxed mb-4">${content}</div>`;
  }

  // Link
  if (link) {
    html += `
      <a
        href="${link}"
        class="inline-flex items-center text-primary font-semibold hover:text-secondary transition-colors duration-200 min-h-[44px]"
        aria-label="${linkText}"
      >
        ${linkText}
        <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    `;
  }

  html += '</div>'; // End card-content

  // Footer
  if (footer) {
    html += `
      <div class="card-footer px-6 py-4 bg-gray-50 border-t border-gray-200">
        ${footer}
      </div>
    `;
  }

  card.innerHTML = html;
  return card;
}

/**
 * Create a testimonial card
 */
export function createTestimonialCard({
  quote,
  author,
  role,
  image,
  rating = 5
}) {
  const card = document.createElement('div');
  card.className = 'testimonial-card bg-white p-6 rounded-xl shadow-lg border-l-4 border-secondary';

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  card.innerHTML = `
    <div class="flex items-center mb-4">
      ${image ? `
        <img
          src="${image}"
          alt="${author}"
          class="w-12 h-12 rounded-full object-cover mr-4"
          loading="lazy"
        />
      ` : ''}
      <div>
        <h4 class="font-semibold text-gray-900">${author}</h4>
        ${role ? `<p class="text-sm text-gray-600">${role}</p>` : ''}
        <div class="text-yellow-500 text-sm" aria-label="${rating} de 5 estrelas">
          ${stars}
        </div>
      </div>
    </div>
    <blockquote class="text-gray-700 italic leading-relaxed">
      "${quote}"
    </blockquote>
  `;

  return card;
}

// ========================================
// MODAL SYSTEM
// ========================================

export class Modal {
  constructor(options = {}) {
    this.id = options.id || `modal-${Date.now()}`;
    this.title = options.title || '';
    this.content = options.content || '';
    this.size = options.size || 'medium'; // small, medium, large, full
    this.onClose = options.onClose || null;
    this.closeOnBackdrop = options.closeOnBackdrop !== false;
    this.showCloseButton = options.showCloseButton !== false;
    this.modal = null;
    this.lastFocusedElement = null;
    this.focusableElements = [];
  }

  create() {
    this.modal = document.createElement('div');
    this.modal.id = this.id;
    this.modal.className = 'modal fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', `${this.id}-title`);
    this.modal.setAttribute('aria-hidden', 'true');

    const sizeClasses = {
      small: 'max-w-md',
      medium: 'max-w-2xl',
      large: 'max-w-4xl',
      full: 'max-w-7xl'
    };

    this.modal.innerHTML = `
      <div
        class="modal-content bg-white rounded-xl shadow-2xl ${sizeClasses[this.size]} w-full max-h-[90vh] overflow-hidden flex flex-col"
        role="document"
        onclick="event.stopPropagation()"
      >
        <div class="modal-header sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 id="${this.id}-title" class="text-2xl font-serif font-bold text-primary">
            ${this.title}
          </h2>
          ${this.showCloseButton ? `
            <button
              class="modal-close text-gray-500 hover:text-gray-700 text-3xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              aria-label="Fechar janela"
              type="button"
            >
              &times;
            </button>
          ` : ''}
        </div>
        <div class="modal-body px-6 py-6 overflow-y-auto flex-1">
          ${this.content}
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Event listeners
    if (this.showCloseButton) {
      const closeBtn = this.modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', () => this.close());
    }

    if (this.closeOnBackdrop) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Keyboard navigation
    this.modal.addEventListener('keydown', (e) => this.handleKeyDown(e));

    return this;
  }

  open() {
    if (!this.modal) {
      this.create();
    }

    this.lastFocusedElement = document.activeElement;
    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus management
    this.focusableElements = Array.from(
      this.modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    if (this.focusableElements.length > 0) {
      setTimeout(() => this.focusableElements[0].focus(), 100);
    }

    return this;
  }

  close() {
    if (!this.modal) return;

    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }

    if (this.onClose) {
      this.onClose();
    }

    return this;
  }

  destroy() {
    if (this.modal) {
      this.close();
      this.modal.remove();
      this.modal = null;
    }
  }

  setContent(content) {
    if (this.modal) {
      const body = this.modal.querySelector('.modal-body');
      body.innerHTML = content;
    }
    this.content = content;
    return this;
  }

  setTitle(title) {
    if (this.modal) {
      const titleEl = this.modal.querySelector(`#${this.id}-title`);
      titleEl.textContent = title;
    }
    this.title = title;
    return this;
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (e.key === 'Tab') {
      if (this.focusableElements.length === 0) return;

      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// ========================================
// LOADING STATES
// ========================================

/**
 * Create a spinner loader
 */
export function createSpinner(size = 'medium', color = 'primary') {
  const spinner = document.createElement('div');
  spinner.className = 'spinner flex items-center justify-center';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-live', 'polite');
  spinner.setAttribute('aria-label', 'A carregar');

  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };

  spinner.innerHTML = `
    <div class="${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin"></div>
    <span class="sr-only">A carregar...</span>
  `;

  return spinner;
}

/**
 * Create a skeleton loader
 */
export function createSkeleton(type = 'text', count = 1) {
  const container = document.createElement('div');
  container.className = 'skeleton-loader animate-pulse';

  const skeletons = {
    text: '<div class="h-4 bg-gray-200 rounded w-full mb-2"></div>',
    title: '<div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>',
    image: '<div class="aspect-video bg-gray-200 rounded-lg mb-4"></div>',
    card: `
      <div class="bg-white p-6 rounded-xl border border-gray-200 mb-4">
        <div class="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    `
  };

  container.innerHTML = skeletons[type].repeat(count);
  return container;
}

/**
 * Show loading overlay
 */
export function showLoadingOverlay(message = 'A carregar...') {
  let overlay = document.getElementById('loading-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
    overlay.innerHTML = `
      <div class="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
        ${createSpinner('large').outerHTML}
        <p class="mt-4 text-gray-700 font-semibold">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  return overlay;
}

/**
 * Hide loading overlay
 */
export function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// ========================================
// ACCORDION COMPONENT
// ========================================

export class Accordion {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    this.allowMultiple = options.allowMultiple || false;
    this.items = [];
    this.activeItems = new Set();
  }

  addItem(title, content, isOpen = false) {
    const item = document.createElement('div');
    item.className = 'accordion-item border-b border-gray-200';

    const id = `accordion-${this.items.length}`;
    const buttonId = `${id}-button`;
    const panelId = `${id}-panel`;

    item.innerHTML = `
      <button
        id="${buttonId}"
        class="accordion-button w-full flex justify-between items-center py-4 px-6 text-left hover:bg-gray-50 transition-colors duration-200 min-h-[44px]"
        aria-expanded="${isOpen}"
        aria-controls="${panelId}"
        type="button"
      >
        <span class="font-semibold text-gray-900 text-lg">${title}</span>
        <svg
          class="accordion-icon w-6 h-6 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id="${panelId}"
        class="accordion-panel overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0'}"
        aria-labelledby="${buttonId}"
        role="region"
      >
        <div class="px-6 py-4 text-gray-700 leading-relaxed">
          ${content}
        </div>
      </div>
    `;

    const button = item.querySelector('.accordion-button');
    const panel = item.querySelector('.accordion-panel');
    const icon = item.querySelector('.accordion-icon');

    button.addEventListener('click', () => {
      this.toggle(this.items.length);
    });

    this.items.push({ item, button, panel, icon, isOpen });

    if (isOpen) {
      this.activeItems.add(this.items.length - 1);
    }

    this.container.appendChild(item);

    return this;
  }

  toggle(index) {
    const item = this.items[index];
    if (!item) return;

    const isCurrentlyOpen = this.activeItems.has(index);

    if (!this.allowMultiple) {
      // Close all others
      this.activeItems.forEach(i => {
        if (i !== index) {
          this.close(i);
        }
      });
    }

    if (isCurrentlyOpen) {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  open(index) {
    const item = this.items[index];
    if (!item) return;

    item.button.setAttribute('aria-expanded', 'true');
    item.panel.style.maxHeight = item.panel.scrollHeight + 'px';
    item.icon.classList.add('rotate-180');
    item.isOpen = true;
    this.activeItems.add(index);
  }

  close(index) {
    const item = this.items[index];
    if (!item) return;

    item.button.setAttribute('aria-expanded', 'false');
    item.panel.style.maxHeight = '0';
    item.icon.classList.remove('rotate-180');
    item.isOpen = false;
    this.activeItems.delete(index);
  }

  openAll() {
    if (this.allowMultiple) {
      this.items.forEach((_, index) => this.open(index));
    }
  }

  closeAll() {
    this.items.forEach((_, index) => this.close(index));
  }
}

// ========================================
// CAROUSEL COMPONENT
// ========================================

export class Carousel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    this.autoplay = options.autoplay || false;
    this.autoplayInterval = options.autoplayInterval || 5000;
    this.loop = options.loop !== false;
    this.showDots = options.showDots !== false;
    this.showArrows = options.showArrows !== false;
    this.items = [];
    this.currentIndex = 0;
    this.autoplayTimer = null;

    this.init();
  }

  init() {
    this.container.className = 'carousel relative overflow-hidden';

    // Create carousel structure
    const track = document.createElement('div');
    track.className = 'carousel-track flex transition-transform duration-500 ease-in-out';
    track.setAttribute('role', 'list');

    // Move existing items to track
    while (this.container.firstChild) {
      const item = this.container.firstChild;
      item.className = 'carousel-item flex-shrink-0 w-full';
      item.setAttribute('role', 'listitem');
      this.items.push(item);
      track.appendChild(item);
    }

    this.container.appendChild(track);
    this.track = track;

    // Add navigation if needed
    if (this.showArrows) {
      this.createArrows();
    }

    if (this.showDots) {
      this.createDots();
    }

    // Start autoplay
    if (this.autoplay) {
      this.startAutoplay();
    }

    // Touch/swipe support
    this.addSwipeSupport();

    // Update view
    this.update();
  }

  createArrows() {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 min-w-[44px] min-h-[44px] z-10';
    prevBtn.setAttribute('aria-label', 'Anterior');
    prevBtn.innerHTML = `
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    `;
    prevBtn.addEventListener('click', () => this.prev());

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 min-w-[44px] min-h-[44px] z-10';
    nextBtn.setAttribute('aria-label', 'Próximo');
    nextBtn.innerHTML = `
      <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    `;
    nextBtn.addEventListener('click', () => this.next());

    this.container.appendChild(prevBtn);
    this.container.appendChild(nextBtn);
  }

  createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10';
    dotsContainer.setAttribute('role', 'tablist');

    this.items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `carousel-dot w-3 h-3 rounded-full transition-all duration-200 ${
        index === 0 ? 'bg-primary w-8' : 'bg-white/70'
      }`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${index + 1}`);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => this.goTo(index));
      dotsContainer.appendChild(dot);
    });

    this.container.appendChild(dotsContainer);
    this.dotsContainer = dotsContainer;
  }

  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoplay();
    }, { passive: true });

    this.container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    this.container.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }

      if (this.autoplay) {
        this.startAutoplay();
      }
    }, { passive: true });
  }

  update() {
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    // Update dots
    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        if (index === this.currentIndex) {
          dot.classList.add('bg-primary', 'w-8');
          dot.classList.remove('bg-white/70');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('bg-primary', 'w-8');
          dot.classList.add('bg-white/70');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else if (this.loop) {
      this.currentIndex = 0;
    }
    this.update();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.loop) {
      this.currentIndex = this.items.length - 1;
    }
    this.update();
  }

  goTo(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.update();
    }
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => this.next(), this.autoplayInterval);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  destroy() {
    this.stopAutoplay();
    this.container.innerHTML = '';
  }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

export class Toast {
  static container = null;

  static init() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.id = 'toast-container';
      Toast.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      Toast.container.setAttribute('aria-live', 'polite');
      Toast.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(Toast.container);
    }
  }

  static show(message, type = 'info', duration = 5000) {
    Toast.init();

    const toast = document.createElement('div');
    toast.className = `toast bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3 min-w-[300px] max-w-md transform transition-all duration-300 translate-x-[400px]`;

    const colors = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    };

    const icons = {
      success: '<svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      error: '<svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>',
      warning: '<svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
      info: '<svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
    };

    toast.classList.add(colors[type] || colors.info);
    toast.innerHTML = `
      ${icons[type] || icons.info}
      <div class="flex-1">
        <p class="text-gray-900 font-medium">${message}</p>
      </div>
      <button class="toast-close text-gray-400 hover:text-gray-600 transition-colors" aria-label="Fechar notificação">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    `;

    Toast.container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-[400px]');
      toast.classList.add('translate-x-0');
    }, 10);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => Toast.close(toast));

    // Auto close
    if (duration > 0) {
      setTimeout(() => Toast.close(toast), duration);
    }

    return toast;
  }

  static close(toast) {
    toast.classList.add('translate-x-[400px]', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }

  static success(message, duration) {
    return Toast.show(message, 'success', duration);
  }

  static error(message, duration) {
    return Toast.show(message, 'error', duration);
  }

  static warning(message, duration) {
    return Toast.show(message, 'warning', duration);
  }

  static info(message, duration) {
    return Toast.show(message, 'info', duration);
  }
}
