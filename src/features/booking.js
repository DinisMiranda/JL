/**
 * Appointment Booking Feature
 * Online appointment scheduling system
 */

import CMS_CONFIG, { isBusinessDay, getBusinessHours } from '../config/cms-config.js';
import { Modal, showLoadingOverlay, hideLoadingOverlay } from '../components/components.js';

/**
 * Create booking form
 */
export function createBookingForm() {
  const section = document.createElement('section');
  section.id = 'marcar-consulta';
  section.className = 'py-16 md:py-24 px-4 bg-gradient-to-br from-primary/5 to-secondary/5';

  section.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
          Marque uma Consulta
        </h2>
        <p class="text-lg text-gray-600">
          Preencha o formulário abaixo e entraremos em contacto para confirmar a sua consulta
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div class="md:grid md:grid-cols-2">
          <!-- Info Panel -->
          <div class="bg-gradient-to-br from-primary to-primary/90 text-white p-8 md:p-12">
            <h3 class="text-2xl font-serif font-semibold mb-6">Informações da Consulta</h3>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 class="font-semibold mb-2">Horário de Atendimento</h4>
                  <p class="text-white/90">Segunda a Sexta: 09:00 - 18:00</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 class="font-semibold mb-2">Duração</h4>
                  <p class="text-white/90">Aproximadamente 60 minutos</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h4 class="font-semibold mb-2">Localização</h4>
                  <p class="text-white/90">Rua Justino Cruz, Braga</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <svg class="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 class="font-semibold mb-2">Primeira Consulta</h4>
                  <p class="text-white/90">Avaliação inicial do caso sem compromisso</p>
                </div>
              </div>
            </div>

            <div class="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <p class="text-sm text-white/90">
                <strong>Nota:</strong> Iremos contactá-lo para confirmar a disponibilidade e ajustar o horário se necessário.
              </p>
            </div>
          </div>

          <!-- Booking Form -->
          <div class="p-8 md:p-12">
            <form id="booking-form" class="space-y-6">
              <div id="booking-message" class="hidden" role="alert" aria-live="polite"></div>

              <div>
                <label for="booking-name" class="block text-gray-700 font-semibold mb-2">
                  Nome Completo <span class="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="booking-name"
                  name="name"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label for="booking-email" class="block text-gray-700 font-semibold mb-2">
                  Email <span class="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="booking-email"
                  name="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label for="booking-phone" class="block text-gray-700 font-semibold mb-2">
                  Telefone <span class="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  id="booking-phone"
                  name="phone"
                  required
                  placeholder="+351 912 345 678"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label for="booking-area" class="block text-gray-700 font-semibold mb-2">
                  Área de Direito <span class="text-primary">*</span>
                </label>
                <select
                  id="booking-area"
                  name="area"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Selecione uma área...</option>
                  ${CMS_CONFIG.practiceAreas.areas.map(area => `
                    <option value="${area.id}">${area.title}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label for="booking-date" class="block text-gray-700 font-semibold mb-2">
                  Data Preferencial <span class="text-primary">*</span>
                </label>
                <input
                  type="date"
                  id="booking-date"
                  name="date"
                  required
                  min="${getMinDate()}"
                  max="${getMaxDate()}"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <p class="text-sm text-gray-500 mt-1">Horário: 09:00 - 18:00 (Seg-Sex)</p>
              </div>

              <div>
                <label for="booking-time" class="block text-gray-700 font-semibold mb-2">
                  Horário Preferencial
                </label>
                <select
                  id="booking-time"
                  name="time"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Selecione um horário...</option>
                  <option value="morning">Manhã (09:00 - 12:00)</option>
                  <option value="afternoon">Tarde (14:00 - 18:00)</option>
                </select>
              </div>

              <div>
                <label for="booking-notes" class="block text-gray-700 font-semibold mb-2">
                  Breve descrição do assunto
                </label>
                <textarea
                  id="booking-notes"
                  name="notes"
                  rows="4"
                  maxlength="500"
                  placeholder="Descreva brevemente o motivo da consulta..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                ></textarea>
                <span class="text-sm text-gray-500">Máximo 500 caracteres</span>
              </div>

              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="booking-consent"
                  name="consent"
                  required
                  class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label for="booking-consent" class="text-sm text-gray-600">
                  Concordo com o tratamento dos meus dados pessoais para efeitos de agendamento da consulta, conforme a política de privacidade.
                </label>
              </div>

              <button
                type="submit"
                id="booking-submit"
                class="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-secondary/50"
              >
                <span id="booking-submit-text">Marcar Consulta</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}

/**
 * Initialize booking form
 */
export function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Setup date validation
  const dateInput = form.querySelector('#booking-date');
  if (dateInput) {
    dateInput.addEventListener('change', validateDate);
  }

  // Form submission
  form.addEventListener('submit', handleBookingSubmit);
}

/**
 * Validate booking date
 */
function validateDate(e) {
  const date = new Date(e.target.value);

  if (!isBusinessDay(date)) {
    alert('Por favor, selecione um dia útil (Segunda a Sexta-feira, excluindo feriados).');
    e.target.value = '';
  }
}

/**
 * Handle booking form submission
 */
async function handleBookingSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('#booking-submit');
  const submitText = form.querySelector('#booking-submit-text');
  const messageDiv = form.querySelector('#booking-message');

  // Collect form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    phone: form.phone.value,
    area: form.area.value,
    date: form.date.value,
    time: form.time.value,
    notes: form.notes.value
  };

  // Validate
  if (!formData.name || !formData.email || !formData.phone || !formData.area || !formData.date) {
    showMessage(messageDiv, 'Por favor, preencha todos os campos obrigatórios.', 'error');
    return;
  }

  // Show loading
  submitBtn.disabled = true;
  submitText.textContent = 'A enviar...';

  try {
    // Send booking request
    await sendBookingRequest(formData);

    // Show success message
    showMessage(messageDiv, 'Pedido de consulta enviado com sucesso! Entraremos em contacto em breve para confirmar.', 'success');

    // Reset form
    form.reset();

  } catch (error) {
    console.error('Booking error:', error);
    showMessage(messageDiv, 'Erro ao enviar pedido. Por favor, tente novamente ou contacte-nos directamente.', 'error');

  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Marcar Consulta';
  }
}

/**
 * Send booking request (integrate with your backend or email service)
 */
async function sendBookingRequest(data) {
  // TODO: Integrate with your backend or email service
  // For now, using EmailJS similar to contact form

  const templateParams = {
    to_email: 'joaojlobo@hotmail.com',
    from_name: data.name,
    from_email: data.email,
    phone: data.phone,
    practice_area: data.area,
    preferred_date: data.date,
    preferred_time: data.time,
    notes: data.notes || 'Sem notas adicionais',
    subject: `Nova Marcação de Consulta - ${data.area}`
  };

  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Booking request:', templateParams);
      resolve({ success: true });
    }, 1000);
  });
}

/**
 * Show message
 */
function showMessage(container, message, type = 'success') {
  container.classList.remove('hidden');

  const bgColor = type === 'success' ? 'bg-green-100 text-green-800 border-green-400' : 'bg-red-100 text-red-800 border-red-400';
  const icon = type === 'success'
    ? '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
    : '<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>';

  container.className = `p-4 rounded-lg mb-6 border flex items-start gap-3 ${bgColor}`;
  container.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      container.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Get minimum bookable date (tomorrow)
 */
function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get maximum bookable date
 */
function getMaxDate() {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + CMS_CONFIG.booking.allowedDaysAhead);
  return maxDate.toISOString().split('T')[0];
}

// Export
export default {
  createBookingForm,
  initBookingForm
};
