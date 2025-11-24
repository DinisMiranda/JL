/**
 * Professional Credentials and Compliance Features
 * Display bar association badges, certifications, and legal compliance information
 */

/**
 * Professional credentials data
 */
export const CREDENTIALS = {
  barAssociation: {
    name: 'Ordem dos Advogados',
    number: '[Cédula Profissional]',
    url: 'https://portal.oa.pt',
    verified: true,
    logo: '/images/credentials/ordem-advogados.png'
  },
  insurance: {
    provider: 'Seguro de Responsabilidade Civil Profissional',
    policyNumber: '[Número da Apólice]',
    coverage: '€500,000',
    validUntil: '2025-12-31',
    verified: true
  },
  education: [
    {
      institution: 'Universidade do Minho',
      degree: 'Licenciatura em Direito',
      year: '2017'
    }
  ],
  memberships: [
    {
      organization: 'Ordem dos Advogados',
      type: 'Membro Inscrito',
      since: '2023'
    }
  ]
};

/**
 * Create professional credentials section
 */
export function createCredentialsSection() {
  const section = document.createElement('section');
  section.id = 'professional-credentials';
  section.className = 'py-12 px-4 bg-gray-50 border-t border-gray-200';

  section.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl font-serif font-semibold text-gray-900 mb-8 text-center">
        Credenciais Profissionais e Conformidade
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Bar Association Badge -->
        <div class="bg-white rounded-lg shadow-md p-6 border-2 border-green-500 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">${CREDENTIALS.barAssociation.name}</h3>
          <p class="text-sm text-gray-600 mb-2">Membro Inscrito</p>
          <div class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Verificado
          </div>
          <a href="${CREDENTIALS.barAssociation.url}" target="_blank" rel="noopener noreferrer" class="mt-3 text-xs text-primary hover:text-secondary underline block">
            Verificar no Portal OA
          </a>
        </div>

        <!-- Professional Insurance -->
        <div class="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Seguro Profissional</h3>
          <p class="text-sm text-gray-600 mb-1">Cobertura: ${CREDENTIALS.insurance.coverage}</p>
          <p class="text-xs text-gray-500 mb-2">Válido até ${new Date(CREDENTIALS.insurance.validUntil).toLocaleDateString('pt-PT')}</p>
          <div class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Em vigor
          </div>
        </div>

        <!-- GDPR Compliance -->
        <div class="bg-white rounded-lg shadow-md p-6 border-2 border-purple-500 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">RGPD Compliant</h3>
          <p class="text-sm text-gray-600 mb-2">Proteção de Dados</p>
          <div class="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Conforme
          </div>
          <a href="/privacy-policy.html" class="mt-3 text-xs text-primary hover:text-secondary underline block">
            Ver Política de Privacidade
          </a>
        </div>

        <!-- Professional Standards -->
        <div class="bg-white rounded-lg shadow-md p-6 border-2 border-amber-500 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Deontologia Profissional</h3>
          <p class="text-sm text-gray-600 mb-2">Código Deontológico OA</p>
          <div class="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Cumprido
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="mt-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
        <div class="flex items-start gap-4">
          <svg class="w-8 h-8 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Transparência e Conformidade Legal</h3>
            <p class="text-gray-700 mb-3">
              O escritório João Lobo Advogados opera em total conformidade com todas as normas e regulamentos aplicáveis à profissão de advogado em Portugal, incluindo:
            </p>
            <ul class="space-y-2 text-sm text-gray-600">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Estatuto da Ordem dos Advogados</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Código Deontológico da Ordem dos Advogados</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Regulamento Geral sobre a Proteção de Dados (RGPD)</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Obrigações de Prevenção do Branqueamento de Capitais</span>
              </li>
            </ul>
            <div class="mt-4 flex flex-wrap gap-3">
              <a href="/professional-liability.html" class="text-primary hover:text-secondary font-semibold text-sm underline">
                Informação sobre Responsabilidade Profissional
              </a>
              <a href="/terms-of-service.html" class="text-primary hover:text-secondary font-semibold text-sm underline">
                Termos e Condições
              </a>
              <a href="/accessibility-statement.html" class="text-primary hover:text-secondary font-semibold text-sm underline">
                Declaração de Acessibilidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}

/**
 * Create compact credentials badge (for footer)
 */
export function createCredentialsBadge() {
  const badge = document.createElement('div');
  badge.className = 'inline-flex items-center gap-4 flex-wrap justify-center text-sm text-gray-600';

  badge.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>Ordem dos Advogados</span>
    </div>

    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>Seguro Profissional</span>
    </div>

    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
      </svg>
      <span>RGPD Conforme</span>
    </div>
  `;

  return badge;
}

/**
 * Initialize credentials display
 */
export function initCredentials() {
  // Add badge to footer if it exists
  const footer = document.querySelector('footer');
  if (footer) {
    const existingBadge = footer.querySelector('#credentials-badge');
    if (!existingBadge) {
      const badgeContainer = document.createElement('div');
      badgeContainer.id = 'credentials-badge';
      badgeContainer.className = 'mt-6 pt-6 border-t border-gray-700';
      badgeContainer.appendChild(createCredentialsBadge());
      footer.querySelector('.max-w-7xl')?.appendChild(badgeContainer);
    }
  }
}

// Export
export default {
  createCredentialsSection,
  createCredentialsBadge,
  initCredentials,
  CREDENTIALS
};
