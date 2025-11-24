/**
 * FAQ Feature
 * Displays frequently asked questions in an accordion format
 */

import { Accordion } from '../components/components.js';
import CMS_CONFIG from '../config/cms-config.js';

/**
 * Load and display FAQs
 */
export async function loadFAQs(containerId = 'faq-section') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`FAQ container #${containerId} not found`);
    return;
  }

  try {
    // Load FAQ data
    const response = await fetch('/content/faqs/faqs.json');
    if (!response.ok) throw new Error('Failed to load FAQs');

    const faqs = await response.json();

    // Group by category
    const categories = groupByCategory(faqs);

    // Create section
    container.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6 text-center">
          Perguntas Frequentes
        </h2>
        <p class="text-lg text-gray-600 mb-12 text-center">
          Encontre respostas para as questões mais comuns
        </p>

        <!-- Category filter -->
        <div class="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            class="faq-filter-btn px-4 py-2 rounded-full border-2 transition-all duration-200 active"
            data-category="all"
          >
            Todas
          </button>
          ${Object.keys(categories).map(category => `
            <button
              class="faq-filter-btn px-4 py-2 rounded-full border-2 transition-all duration-200"
              data-category="${category}"
            >
              ${category}
            </button>
          `).join('')}
        </div>

        <!-- FAQ accordion -->
        <div id="faq-accordion" class="bg-white rounded-xl shadow-lg overflow-hidden">
          <!-- FAQs will be inserted here -->
        </div>
      </div>
    `;

    const accordionContainer = container.querySelector('#faq-accordion');

    // Initialize accordion
    const accordion = new Accordion(accordionContainer, {
      allowMultiple: CMS_CONFIG.faqs.allowMultipleOpen
    });

    // Add FAQ items sorted by order
    faqs.sort((a, b) => a.order - b.order).forEach(faq => {
      accordion.addItem(
        faq.question,
        `<p class="text-gray-700">${faq.answer}</p>`,
        false
      );

      // Add category data attribute
      const lastItem = accordionContainer.lastElementChild;
      if (lastItem) {
        lastItem.setAttribute('data-category', faq.category);
      }
    });

    // Add filter functionality
    setupFilters(container, accordionContainer);

    return accordion;

  } catch (error) {
    console.error('Error loading FAQs:', error);
    container.innerHTML = `
      <div class="max-w-4xl mx-auto text-center py-12">
        <p class="text-gray-600">Não foi possível carregar as perguntas frequentes no momento.</p>
      </div>
    `;
  }
}

/**
 * Group FAQs by category
 */
function groupByCategory(faqs) {
  return faqs.reduce((acc, faq) => {
    const category = faq.category || 'Geral';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});
}

/**
 * Setup category filters
 */
function setupFilters(container, accordionContainer) {
  const filterButtons = container.querySelectorAll('.faq-filter-btn');
  const faqItems = accordionContainer.querySelectorAll('.accordion-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Update active button
      filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white', 'border-primary');
        btn.classList.add('border-gray-300', 'text-gray-700', 'hover:border-primary');
      });
      button.classList.add('active', 'bg-primary', 'text-white', 'border-primary');
      button.classList.remove('border-gray-300', 'text-gray-700', 'hover:border-primary');

      // Filter FAQ items
      faqItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Create FAQ section HTML
 */
export function createFAQSection() {
  const section = document.createElement('section');
  section.id = 'faqs';
  section.className = 'py-16 md:py-24 px-4 bg-white';
  section.setAttribute('aria-labelledby', 'faq-heading');

  section.innerHTML = `
    <div id="faq-section" aria-live="polite">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-block">
          ${createSpinner('large').outerHTML}
        </div>
        <p class="mt-4 text-gray-600">A carregar perguntas frequentes...</p>
      </div>
    </div>
  `;

  return section;
}

// Helper to create spinner
function createSpinner(size = 'medium') {
  const spinner = document.createElement('div');
  spinner.className = 'spinner flex items-center justify-center';
  spinner.setAttribute('role', 'status');

  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  spinner.innerHTML = `
    <div class="${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <span class="sr-only">A carregar...</span>
  `;

  return spinner;
}

/**
 * Add search functionality to FAQs
 */
export function addFAQSearch(accordionContainer) {
  const searchInput = document.createElement('div');
  searchInput.className = 'mb-6';
  searchInput.innerHTML = `
    <div class="relative">
      <input
        type="search"
        id="faq-search"
        placeholder="Procurar nas perguntas..."
        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  `;

  accordionContainer.parentElement.insertBefore(searchInput, accordionContainer);

  // Add search functionality
  const input = searchInput.querySelector('#faq-search');
  const items = accordionContainer.querySelectorAll('.accordion-item');

  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    items.forEach(item => {
      const question = item.querySelector('.accordion-button span').textContent.toLowerCase();
      const answer = item.querySelector('.accordion-panel').textContent.toLowerCase();

      if (question.includes(query) || answer.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// Export for use in other modules
export default {
  loadFAQs,
  createFAQSection,
  addFAQSearch
};
