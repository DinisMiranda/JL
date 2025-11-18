/**
 * Testimonials Feature
 * Displays client testimonials in a carousel format
 */

import { Carousel, createTestimonialCard } from '../components/components.js';
import CMS_CONFIG from '../config/cms-config.js';

/**
 * Load and display testimonials
 */
export async function loadTestimonials(containerId = 'testimonials-section') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Testimonials container #${containerId} not found`);
    return;
  }

  try {
    // Load testimonials data
    const response = await fetch('/content/testimonials/testimonials.json');
    if (!response.ok) throw new Error('Failed to load testimonials');

    const testimonials = await response.json();

    // Create section
    container.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-12 text-center">
          O que dizem os nossos clientes
        </h2>
        <div id="testimonials-carousel" class="relative px-4">
          <!-- Testimonials will be inserted here -->
        </div>
      </div>
    `;

    const carouselContainer = container.querySelector('#testimonials-carousel');

    // Add testimonial cards to carousel
    testimonials.forEach(testimonial => {
      const card = createTestimonialCard(testimonial);
      card.classList.add('px-4'); // Add padding for carousel
      carouselContainer.appendChild(card);
    });

    // Initialize carousel
    const carousel = new Carousel(carouselContainer, {
      autoplay: CMS_CONFIG.testimonials.autoplay,
      autoplayInterval: CMS_CONFIG.testimonials.autoplayInterval,
      loop: true,
      showDots: true,
      showArrows: true
    });

    return carousel;

  } catch (error) {
    console.error('Error loading testimonials:', error);
    container.innerHTML = `
      <div class="max-w-7xl mx-auto text-center py-12">
        <p class="text-gray-600">Não foi possível carregar os depoimentos no momento.</p>
      </div>
    `;
  }
}

/**
 * Create testimonials section HTML
 */
export function createTestimonialsSection() {
  const section = document.createElement('section');
  section.id = 'testimonials';
  section.className = 'py-16 md:py-24 px-4 bg-gray-50';
  section.setAttribute('aria-labelledby', 'testimonials-heading');

  section.innerHTML = `
    <div id="testimonials-section" aria-live="polite">
      <div class="max-w-7xl mx-auto text-center">
        <div class="inline-block">
          ${createSpinner('large').outerHTML}
        </div>
        <p class="mt-4 text-gray-600">A carregar depoimentos...</p>
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
 * Add testimonial submission form (for future use)
 */
export function createTestimonialForm() {
  return `
    <div class="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h3 class="text-2xl font-serif font-semibold text-primary mb-6">Partilhe a sua experiência</h3>
      <form id="testimonial-form" class="space-y-4">
        <div>
          <label for="testimonial-name" class="block text-gray-700 font-semibold mb-2">Nome</label>
          <input
            type="text"
            id="testimonial-name"
            name="name"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label for="testimonial-email" class="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            id="testimonial-email"
            name="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label for="testimonial-role" class="block text-gray-700 font-semibold mb-2">Área de serviço</label>
          <select
            id="testimonial-role"
            name="role"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione...</option>
            <option value="Direito Civil">Direito Civil</option>
            <option value="Direito Comercial">Direito Comercial</option>
            <option value="Direito Penal">Direito Penal</option>
            <option value="Direito da Família">Direito da Família</option>
            <option value="Direito Imobiliário">Direito Imobiliário</option>
            <option value="Direito Internacional">Direito Internacional</option>
          </select>
        </div>

        <div>
          <label for="testimonial-rating" class="block text-gray-700 font-semibold mb-2">Avaliação</label>
          <div class="flex gap-2">
            ${[1, 2, 3, 4, 5].map(n => `
              <button
                type="button"
                class="rating-star text-3xl text-gray-300 hover:text-yellow-500 transition-colors"
                data-rating="${n}"
                aria-label="${n} estrelas"
              >★</button>
            `).join('')}
          </div>
          <input type="hidden" id="testimonial-rating" name="rating" value="5" />
        </div>

        <div>
          <label for="testimonial-message" class="block text-gray-700 font-semibold mb-2">O seu depoimento</label>
          <textarea
            id="testimonial-message"
            name="message"
            rows="5"
            required
            maxlength="500"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          ></textarea>
          <span class="text-sm text-gray-500">Máximo 500 caracteres</span>
        </div>

        <button
          type="submit"
          class="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
        >
          Enviar Depoimento
        </button>

        <p class="text-xs text-gray-500 text-center">
          O seu depoimento será revisado antes de ser publicado.
        </p>
      </form>
    </div>
  `;
}

// Export for use in other modules
export default {
  loadTestimonials,
  createTestimonialsSection,
  createTestimonialForm
};
