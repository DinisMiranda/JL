/**
 * Form Compliance Utilities
 * GDPR-compliant data processing notices and consent management for forms
 */

/**
 * Create GDPR data processing notice
 */
export function createDataProcessingNotice(formType = 'contact') {
  const notices = {
    contact: {
      title: 'Proteção de Dados Pessoais',
      text: `Os dados pessoais que nos fornecer serão tratados por João Lobo Advogados para fins de contacto e prestação de serviços jurídicos.
            Os seus dados serão conservados enquanto durar a nossa relação profissional ou pelo período legalmente exigido.
            Tem direito a aceder, retificar, apagar ou limitar o tratamento dos seus dados.`,
      link: '/privacy-policy.html'
    },
    booking: {
      title: 'Tratamento de Dados para Agendamento',
      text: `Os dados fornecidos serão utilizados exclusivamente para processar o seu pedido de consulta e comunicações relacionadas.
            Não partilharemos os seus dados com terceiros sem o seu consentimento, exceto quando legalmente obrigatório.`,
      link: '/privacy-policy.html'
    },
    newsletter: {
      title: 'Subscrição de Newsletter',
      text: `O seu email será utilizado apenas para enviar newsletters e comunicações sobre atualizações jurídicas.
            Pode cancelar a subscrição a qualquer momento através do link no email ou contactando-nos diretamente.`,
      link: '/privacy-policy.html'
    }
  };

  const notice = notices[formType] || notices.contact;

  return `
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">${notice.title}</h3>
          <p class="text-sm text-blue-800 leading-relaxed mb-2">
            ${notice.text}
          </p>
          <a href="${notice.link}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 underline font-semibold">
            Ler Política de Privacidade Completa
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create consent checkboxes
 */
export function createConsentCheckboxes(options = {}) {
  const {
    requiredConsent = true,
    marketingConsent = false,
    profilingConsent = false
  } = options;

  let html = '<div class="space-y-3">';

  // Required consent (GDPR compliance)
  if (requiredConsent) {
    html += `
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent-data-processing"
          name="consent_data_processing"
          required
          class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
        />
        <label for="consent-data-processing" class="text-sm text-gray-700 cursor-pointer">
          Li e aceito a <a href="/privacy-policy.html" target="_blank" class="text-primary hover:text-secondary underline">Política de Privacidade</a>
          e autorizo o tratamento dos meus dados pessoais para os fins indicados.
          <span class="text-red-600">*</span>
        </label>
      </div>
    `;
  }

  // Optional marketing consent
  if (marketingConsent) {
    html += `
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent-marketing"
          name="consent_marketing"
          class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
        />
        <label for="consent-marketing" class="text-sm text-gray-700 cursor-pointer">
          Aceito receber comunicações de marketing, newsletters e informações sobre serviços
          (pode cancelar a qualquer momento).
        </label>
      </div>
    `;
  }

  // Optional profiling consent
  if (profilingConsent) {
    html += `
      <div class="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent-profiling"
          name="consent_profiling"
          class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
        />
        <label for="consent-profiling" class="text-sm text-gray-700 cursor-pointer">
          Aceito que os meus dados sejam utilizados para análise e personalização de serviços.
        </label>
      </div>
    `;
  }

  html += '</div>';

  return html;
}

/**
 * Add compliance elements to existing form
 */
export function addComplianceToForm(formId, options = {}) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const formType = options.formType || 'contact';

  // Find the submit button
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return false;

  // Create compliance container
  const complianceContainer = document.createElement('div');
  complianceContainer.className = 'form-compliance mt-6';

  // Add data processing notice
  complianceContainer.innerHTML = createDataProcessingNotice(formType);

  // Add consent checkboxes
  const consentHTML = createConsentCheckboxes(options);
  complianceContainer.innerHTML += consentHTML;

  // Insert before submit button
  form.insertBefore(complianceContainer, submitButton.parentElement);

  return true;
}

/**
 * Validate consent before form submission
 */
export function validateConsent(formElement) {
  const requiredConsent = formElement.querySelector('#consent-data-processing');

  if (requiredConsent && !requiredConsent.checked) {
    alert('Deve aceitar a Política de Privacidade para continuar.');
    requiredConsent.focus();
    return false;
  }

  return true;
}

/**
 * Get consent data from form
 */
export function getConsentData(formElement) {
  const dataProcessing = formElement.querySelector('#consent-data-processing');
  const marketing = formElement.querySelector('#consent-marketing');
  const profiling = formElement.querySelector('#consent-profiling');

  return {
    dataProcessing: dataProcessing ? dataProcessing.checked : false,
    marketing: marketing ? marketing.checked : false,
    profiling: profiling ? profiling.checked : false,
    timestamp: new Date().toISOString(),
    ipAddress: null, // Should be collected server-side
    userAgent: navigator.userAgent
  };
}

/**
 * Create right to be forgotten (data deletion) form
 */
export function createDataDeletionForm() {
  return `
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-serif font-bold text-gray-900 mb-4">
        Pedido de Eliminação de Dados Pessoais
      </h2>

      <p class="text-gray-700 mb-6">
        De acordo com o RGPD, tem o direito de solicitar a eliminação dos seus dados pessoais.
        Por favor, preencha o formulário abaixo para processar o seu pedido.
      </p>

      <form id="data-deletion-form" class="space-y-4">
        <div>
          <label for="deletion-name" class="block text-gray-700 font-semibold mb-2">
            Nome Completo <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="deletion-name"
            name="name"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label for="deletion-email" class="block text-gray-700 font-semibold mb-2">
            Email <span class="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="deletion-email"
            name="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p class="text-sm text-gray-500 mt-1">
            Use o mesmo email que forneceu anteriormente
          </p>
        </div>

        <div>
          <label for="deletion-reason" class="block text-gray-700 font-semibold mb-2">
            Motivo do Pedido (Opcional)
          </label>
          <textarea
            id="deletion-reason"
            name="reason"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          ></textarea>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800">
            <strong>Nota:</strong> A eliminação de dados pode não ser possível se estivermos legalmente obrigados
            a conservá-los (por exemplo, para fins fiscais ou processos em curso). Informá-lo-emos sobre
            quaisquer limitações.
          </p>
        </div>

        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            id="deletion-confirm"
            name="confirm"
            required
            class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label for="deletion-confirm" class="text-sm text-gray-700">
            Confirmo que pretendo a eliminação dos meus dados pessoais e compreendo que esta ação
            pode ser irreversível. <span class="text-red-600">*</span>
          </label>
        </div>

        <button
          type="submit"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50"
        >
          Submeter Pedido de Eliminação
        </button>

        <p class="text-xs text-gray-500 text-center">
          Responderemos ao seu pedido no prazo de 30 dias conforme exigido pelo RGPD.
        </p>
      </form>
    </div>
  `;
}

/**
 * Create data portability form
 */
export function createDataPortabilityForm() {
  return `
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-serif font-bold text-gray-900 mb-4">
        Pedido de Portabilidade de Dados
      </h2>

      <p class="text-gray-700 mb-6">
        Tem o direito de receber os seus dados pessoais num formato estruturado e legível por máquina.
      </p>

      <form id="data-portability-form" class="space-y-4">
        <div>
          <label for="portability-name" class="block text-gray-700 font-semibold mb-2">
            Nome Completo <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="portability-name"
            name="name"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label for="portability-email" class="block text-gray-700 font-semibold mb-2">
            Email <span class="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="portability-email"
            name="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label for="portability-format" class="block text-gray-700 font-semibold mb-2">
            Formato Pretendido
          </label>
          <select
            id="portability-format"
            name="format"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="json">JSON (recomendado)</option>
            <option value="csv">CSV</option>
            <option value="xml">XML</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <button
          type="submit"
          class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50"
        >
          Solicitar Dados
        </button>

        <p class="text-xs text-gray-500 text-center">
          Enviaremos os seus dados para o email fornecido no prazo de 30 dias.
        </p>
      </form>
    </div>
  `;
}

/**
 * Initialize form compliance for all forms on page
 */
export function initializeFormCompliance() {
  // Add compliance to contact form
  addComplianceToForm('contact-form', {
    formType: 'contact',
    requiredConsent: true,
    marketingConsent: true
  });

  // Add compliance to booking form
  addComplianceToForm('booking-form', {
    formType: 'booking',
    requiredConsent: true,
    marketingConsent: false
  });

  // Add compliance to newsletter form
  addComplianceToForm('newsletter-form', {
    formType: 'newsletter',
    requiredConsent: true,
    marketingConsent: false
  });

  // Add validation to all forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!validateConsent(form)) {
        e.preventDefault();
        return false;
      }

      // Log consent data (should be sent to server)
      const consentData = getConsentData(form);
      console.log('Consent data:', consentData);
    });
  });
}

// Export
export default {
  createDataProcessingNotice,
  createConsentCheckboxes,
  addComplianceToForm,
  validateConsent,
  getConsentData,
  createDataDeletionForm,
  createDataPortabilityForm,
  initializeFormCompliance
};
