/**
 * Newsletter Subscription Feature
 * Email newsletter signup with validation
 */

import CMS_CONFIG from '../config/cms-config.js';

/**
 * Create newsletter signup section
 */
export function createNewsletterSection() {
  const section = document.createElement('section');
  section.id = 'newsletter';
  section.className = 'py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-primary/90 text-white';

  section.innerHTML = `
    <div class="max-w-4xl mx-auto text-center">
      <div class="mb-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 class="text-3xl md:text-4xl font-serif font-bold mb-4">
          Mantenha-se Informado
        </h2>
        <p class="text-xl text-white/90">
          Subscreva a nossa newsletter e receba atualizações sobre legislação, dicas jurídicas e novidades do escritório.
        </p>
      </div>

      <form id="newsletter-form" class="max-w-2xl mx-auto">
        <div id="newsletter-message" class="hidden mb-4" role="alert" aria-live="polite"></div>

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label for="newsletter-email" class="sr-only">Email</label>
            <input
              type="email"
              id="newsletter-email"
              name="email"
              required
              placeholder="O seu email"
              class="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
            />
          </div>
          <button
            type="submit"
            id="newsletter-submit"
            class="px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 whitespace-nowrap"
          >
            <span id="newsletter-submit-text">Subscrever</span>
          </button>
        </div>

        <p class="mt-4 text-sm text-white/80">
          Ao subscrever, concorda em receber emails do nosso escritório. Pode cancelar a qualquer momento.
        </p>
      </form>

      <!-- Newsletter benefits -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div class="flex items-start gap-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
          <svg class="w-8 h-8 flex-shrink-0 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h3 class="font-semibold mb-2">Atualizações Legislativas</h3>
            <p class="text-sm text-white/80">Fique a par das últimas alterações legais</p>
          </div>
        </div>

        <div class="flex items-start gap-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
          <svg class="w-8 h-8 flex-shrink-0 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <div>
            <h3 class="font-semibold mb-2">Dicas Jurídicas</h3>
            <p class="text-sm text-white/80">Conselhos práticos para o seu dia-a-dia</p>
          </div>
        </div>

        <div class="flex items-start gap-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
          <svg class="w-8 h-8 flex-shrink-0 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div>
            <h3 class="font-semibold mb-2">Notícias do Escritório</h3>
            <p class="text-sm text-white/80">Novidades e eventos importantes</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}

/**
 * Initialize newsletter form
 */
export function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', handleNewsletterSubmit);
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const emailInput = form.querySelector('#newsletter-email');
  const submitBtn = form.querySelector('#newsletter-submit');
  const submitText = form.querySelector('#newsletter-submit-text');
  const messageDiv = form.querySelector('#newsletter-message');

  const email = emailInput.value.trim();

  // Validate email
  if (!isValidEmail(email)) {
    showMessage(messageDiv, 'Por favor, insira um email válido.', 'error');
    return;
  }

  // Show loading
  submitBtn.disabled = true;
  submitText.textContent = 'A processar...';

  try {
    // Send subscription request
    await subscribeToNewsletter(email);

    // Show success message
    showMessage(
      messageDiv,
      'Subscrição realizada com sucesso! Verifique o seu email para confirmar.',
      'success'
    );

    // Reset form
    form.reset();

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    showMessage(
      messageDiv,
      'Erro ao processar subscrição. Por favor, tente novamente mais tarde.',
      'error'
    );

  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Subscrever';
  }
}

/**
 * Subscribe to newsletter
 */
async function subscribeToNewsletter(email) {
  // TODO: Integrate with your newsletter service (EmailJS, Mailchimp, etc.)

  const templateParams = {
    to_email: 'joaojlobo@hotmail.com',
    subscriber_email: email,
    subscribe_date: new Date().toISOString(),
    list_id: CMS_CONFIG.newsletter.listId,
    subject: 'Nova Subscrição - Newsletter'
  };

  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Newsletter subscription:', templateParams);

      // Store in localStorage for tracking
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }

      resolve({ success: true });
    }, 1000);
  });
}

/**
 * Validate email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Show message
 */
function showMessage(container, message, type = 'success') {
  container.classList.remove('hidden');

  const bgColor = type === 'success'
    ? 'bg-green-500 text-white'
    : 'bg-red-500 text-white';

  container.className = `p-4 rounded-lg mb-4 ${bgColor}`;
  container.textContent = message;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    container.classList.add('hidden');
  }, 5000);
}

/**
 * Create inline newsletter signup (for embedding in other sections)
 */
export function createInlineNewsletterSignup() {
  return `
    <div class="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 border-2 border-primary/20">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex-1">
          <h3 class="text-2xl font-serif font-semibold text-gray-900 mb-2">
            Subscreva a Nossa Newsletter
          </h3>
          <p class="text-gray-600">
            Receba atualizações jurídicas e dicas práticas diretamente no seu email
          </p>
        </div>
        <div class="flex-shrink-0">
          <a
            href="#newsletter"
            class="inline-block px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Subscrever Agora
          </a>
        </div>
      </div>
    </div>
  `;
}

// Export
export default {
  createNewsletterSection,
  initNewsletterForm,
  createInlineNewsletterSignup
};
