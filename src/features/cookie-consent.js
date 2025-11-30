/**
 * GDPR Cookie Consent Management
 * Compliant with GDPR, ePrivacy Directive, and Portuguese law
 */

/**
 * Cookie categories
 */
export const COOKIE_CATEGORIES = {
  ESSENTIAL: 'essential',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PREFERENCES: 'preferences'
};

/**
 * Cookie consent manager
 */
export class CookieConsentManager {
  constructor() {
    this.consentKey = 'jl_cookie_consent';
    this.consentVersion = '1.0';
    this.consent = this.loadConsent();
    this.banner = null;
    this.settingsModal = null;
  }

  /**
   * Initialize cookie consent
   */
  init() {
    // Check if consent is needed
    if (!this.hasValidConsent()) {
      this.showBanner();
    } else {
      this.applyConsent();
    }

    // Add settings button to footer or header
    this.addSettingsButton();
  }

  /**
   * Check if user has valid consent
   */
  hasValidConsent() {
    if (!this.consent) return false;
    if (this.consent.version !== this.consentVersion) return false;

    // Check if consent is older than 12 months
    const consentDate = new Date(this.consent.timestamp);
    const now = new Date();
    const monthsDiff = (now - consentDate) / (1000 * 60 * 60 * 24 * 30);

    return monthsDiff < 12;
  }

  /**
   * Load consent from storage
   */
  loadConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading consent:', error);
      return null;
    }
  }

  /**
   * Save consent to storage
   */
  saveConsent(categories) {
    const consent = {
      version: this.consentVersion,
      timestamp: new Date().toISOString(),
      categories: categories
    };

    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consent));
      this.consent = consent;
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }

  /**
   * Show cookie consent banner
   */
  showBanner() {
    if (this.banner) return;

    this.banner = document.createElement('div');
    this.banner.id = 'cookie-consent-banner';
    this.banner.className = 'cookie-consent-banner fixed bottom-0 left-0 right-0 z-[100] bg-white shadow-2xl border-t-4 border-primary transform transition-transform duration-500';
    this.banner.setAttribute('role', 'dialog');
    this.banner.setAttribute('aria-labelledby', 'cookie-banner-title');
    this.banner.setAttribute('aria-describedby', 'cookie-banner-description');

    this.banner.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <!-- Icon -->
          <div class="flex-shrink-0 hidden md:block">
            <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h2 id="cookie-banner-title" class="text-xl font-serif font-semibold text-gray-900 mb-2">
              Este website utiliza cookies
            </h2>
            <p id="cookie-banner-description" class="text-gray-700 text-sm md:text-base leading-relaxed">
              Utilizamos cookies para melhorar a sua experiência, analisar o tráfego do site e personalizar conteúdos.
              Alguns cookies são essenciais para o funcionamento do site. Pode escolher quais categorias de cookies aceitar.
            </p>
            <div class="mt-3">
              <a href="/privacy-policy.html" class="text-primary hover:text-secondary underline text-sm font-semibold">
                Política de Privacidade
              </a>
              <span class="text-gray-400 mx-2">|</span>
              <a href="/cookie-policy.html" class="text-primary hover:text-secondary underline text-sm font-semibold">
                Política de Cookies
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              id="cookie-accept-all"
              class="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50 min-h-[44px]"
              aria-label="Aceitar todos os cookies"
            >
              Aceitar Todos
            </button>
            <button
              id="cookie-accept-essential"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500/50 min-h-[44px]"
              aria-label="Aceitar apenas cookies essenciais"
            >
              Apenas Essenciais
            </button>
            <button
              id="cookie-customize"
              class="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-primary transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 min-h-[44px]"
              aria-label="Personalizar preferências de cookies"
            >
              Personalizar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.banner);

    // Add event listeners
    this.banner.querySelector('#cookie-accept-all').addEventListener('click', () => this.acceptAll());
    this.banner.querySelector('#cookie-accept-essential').addEventListener('click', () => this.acceptEssential());
    this.banner.querySelector('#cookie-customize').addEventListener('click', () => this.showSettings());

    // Animate in
    setTimeout(() => {
      this.banner.style.transform = 'translateY(0)';
    }, 100);
  }

  /**
   * Hide banner
   */
  hideBanner() {
    if (!this.banner) return;

    this.banner.style.transform = 'translateY(100%)';
    setTimeout(() => {
      this.banner.remove();
      this.banner = null;
    }, 500);
  }

  /**
   * Accept all cookies
   */
  acceptAll() {
    const categories = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.ANALYTICS]: true,
      [COOKIE_CATEGORIES.MARKETING]: true,
      [COOKIE_CATEGORIES.PREFERENCES]: true
    };

    this.saveConsent(categories);
    this.applyConsent();
    this.hideBanner();
    this.hideSettings();
  }

  /**
   * Accept only essential cookies
   */
  acceptEssential() {
    const categories = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.ANALYTICS]: false,
      [COOKIE_CATEGORIES.MARKETING]: false,
      [COOKIE_CATEGORIES.PREFERENCES]: false
    };

    this.saveConsent(categories);
    this.applyConsent();
    this.hideBanner();
    this.hideSettings();
  }

  /**
   * Show settings modal
   */
  showSettings() {
    if (this.settingsModal) return;

    const currentConsent = this.consent?.categories || {};

    this.settingsModal = document.createElement('div');
    this.settingsModal.id = 'cookie-settings-modal';
    this.settingsModal.className = 'fixed inset-0 z-[101] bg-black/50 flex items-center justify-center p-4';
    this.settingsModal.setAttribute('role', 'dialog');
    this.settingsModal.setAttribute('aria-modal', 'true');
    this.settingsModal.setAttribute('aria-labelledby', 'cookie-settings-title');

    this.settingsModal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 id="cookie-settings-title" class="text-2xl font-serif font-bold text-primary">
            Preferências de Cookies
          </h2>
          <button
            id="close-cookie-settings"
            class="text-gray-500 hover:text-gray-700 text-3xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            aria-label="Fechar janela de preferências"
          >
            &times;
          </button>
        </div>

        <div class="px-6 py-6 space-y-6">
          <p class="text-gray-700 leading-relaxed">
            Pode escolher quais categorias de cookies aceitar. Os cookies essenciais são necessários para o funcionamento básico do site e não podem ser desativados.
          </p>

          <!-- Essential Cookies -->
          <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">Cookies Essenciais</h3>
                  <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Sempre Ativo</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">
                  Estes cookies são necessários para o funcionamento básico do website e não podem ser desativados.
                  Incluem cookies de sessão, segurança e acessibilidade.
                </p>
                <details class="text-sm text-gray-600">
                  <summary class="cursor-pointer font-semibold hover:text-primary">Ver cookies utilizados</summary>
                  <ul class="mt-2 ml-4 list-disc space-y-1">
                    <li>jl_cookie_consent - Armazena preferências de cookies</li>
                    <li>jl_session - Gestão de sessão do utilizador</li>
                  </ul>
                </details>
              </div>
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  checked
                  disabled
                  class="w-6 h-6 rounded text-primary cursor-not-allowed opacity-50"
                />
              </div>
            </div>
          </div>

          <!-- Analytics Cookies -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Cookies de Análise</h3>
                <p class="text-sm text-gray-600 mb-3">
                  Estes cookies permitem-nos analisar o uso do website e melhorar a experiência do utilizador.
                  Recolhem informações anónimas sobre como os visitantes usam o site.
                </p>
                <details class="text-sm text-gray-600">
                  <summary class="cursor-pointer font-semibold hover:text-primary">Ver cookies utilizados</summary>
                  <ul class="mt-2 ml-4 list-disc space-y-1">
                    <li>_ga - Google Analytics (identificador único)</li>
                    <li>_gid - Google Analytics (identificador de sessão)</li>
                  </ul>
                </details>
              </div>
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  id="cookie-analytics"
                  ${currentConsent[COOKIE_CATEGORIES.ANALYTICS] ? 'checked' : ''}
                  class="w-6 h-6 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Marketing Cookies -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Cookies de Marketing</h3>
                <p class="text-sm text-gray-600 mb-3">
                  Estes cookies são utilizados para mostrar anúncios relevantes e medir a eficácia das campanhas.
                  Podem rastrear a sua navegação em diferentes websites.
                </p>
                <details class="text-sm text-gray-600">
                  <summary class="cursor-pointer font-semibold hover:text-primary">Ver cookies utilizados</summary>
                  <ul class="mt-2 ml-4 list-disc space-y-1">
                    <li>_fbp - Facebook Pixel (se aplicável)</li>
                    <li>NID - Google Ads (se aplicável)</li>
                  </ul>
                </details>
              </div>
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  id="cookie-marketing"
                  ${currentConsent[COOKIE_CATEGORIES.MARKETING] ? 'checked' : ''}
                  class="w-6 h-6 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Preferences Cookies -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Cookies de Preferências</h3>
                <p class="text-sm text-gray-600 mb-3">
                  Estes cookies permitem que o website se lembre das suas escolhas (como idioma ou região)
                  para proporcionar uma experiência mais personalizada.
                </p>
                <details class="text-sm text-gray-600">
                  <summary class="cursor-pointer font-semibold hover:text-primary">Ver cookies utilizados</summary>
                  <ul class="mt-2 ml-4 list-disc space-y-1">
                    <li>jl_preferences - Preferências do utilizador</li>
                    <li>jl_theme - Tema do site (se aplicável)</li>
                  </ul>
                </details>
              </div>
              <div class="flex-shrink-0">
                <input
                  type="checkbox"
                  id="cookie-preferences"
                  ${currentConsent[COOKIE_CATEGORIES.PREFERENCES] ? 'checked' : ''}
                  class="w-6 h-6 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-900">
                <p class="font-semibold mb-1">Informação sobre Proteção de Dados</p>
                <p>
                  Os seus dados são tratados de acordo com o RGPD e a legislação portuguesa.
                  Para mais informações, consulte a nossa
                  <a href="/privacy-policy.html" class="underline hover:text-blue-700">Política de Privacidade</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            id="save-cookie-preferences"
            class="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/50 min-h-[44px]"
          >
            Guardar Preferências
          </button>
          <button
            id="accept-all-cookies"
            class="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-secondary/50 min-h-[44px]"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.settingsModal);

    // Add event listeners
    this.settingsModal.querySelector('#close-cookie-settings').addEventListener('click', () => this.hideSettings());
    this.settingsModal.querySelector('#save-cookie-preferences').addEventListener('click', () => this.saveCustomPreferences());
    this.settingsModal.querySelector('#accept-all-cookies').addEventListener('click', () => this.acceptAll());
    this.settingsModal.addEventListener('click', () => this.hideSettings());
  }

  /**
   * Hide settings modal
   */
  hideSettings() {
    if (!this.settingsModal) return;
    this.settingsModal.remove();
    this.settingsModal = null;
  }

  /**
   * Save custom preferences
   */
  saveCustomPreferences() {
    if (!this.settingsModal) return;

    const categories = {
      [COOKIE_CATEGORIES.ESSENTIAL]: true,
      [COOKIE_CATEGORIES.ANALYTICS]: this.settingsModal.querySelector('#cookie-analytics').checked,
      [COOKIE_CATEGORIES.MARKETING]: this.settingsModal.querySelector('#cookie-marketing').checked,
      [COOKIE_CATEGORIES.PREFERENCES]: this.settingsModal.querySelector('#cookie-preferences').checked
    };

    this.saveConsent(categories);
    this.applyConsent();
    this.hideSettings();
    this.hideBanner();
  }

  /**
   * Apply consent (enable/disable cookies)
   */
  applyConsent() {
    if (!this.consent) return;

    const categories = this.consent.categories;

    // Analytics
    if (categories[COOKIE_CATEGORIES.ANALYTICS]) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }

    // Marketing
    if (categories[COOKIE_CATEGORIES.MARKETING]) {
      this.enableMarketing();
    } else {
      this.disableMarketing();
    }

    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: { consent: this.consent }
    }));
  }

  /**
   * Enable analytics
   */
  enableAnalytics() {
    // Enable Google Analytics if configured
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  }

  /**
   * Disable analytics
   */
  disableAnalytics() {
    // Disable Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }

    // Remove GA cookies
    this.deleteCookiesStartingWith('_ga');
    this.deleteCookiesStartingWith('_gid');
  }

  /**
   * Enable marketing
   */
  enableMarketing() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'ad_storage': 'granted'
      });
    }
  }

  /**
   * Disable marketing
   */
  disableMarketing() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'ad_storage': 'denied'
      });
    }

    // Remove marketing cookies
    this.deleteCookiesStartingWith('_fbp');
    this.deleteCookie('NID');
  }

  /**
   * Delete cookie
   */
  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Delete cookies starting with prefix
   */
  deleteCookiesStartingWith(prefix) {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith(prefix)) {
        this.deleteCookie(name);
      }
    });
  }

  /**
   * Add settings button
   */
  addSettingsButton() {
    const button = document.createElement('button');
    button.id = 'cookie-settings-trigger';
    button.className = 'fixed bottom-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg border-2 border-gray-200 hover:border-primary transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50';
    button.setAttribute('aria-label', 'Preferências de cookies');
    button.setAttribute('title', 'Preferências de cookies');

    button.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    `;

    button.addEventListener('click', () => this.showSettings());

    document.body.appendChild(button);
  }

  /**
   * Check if category is consented
   */
  hasConsent(category) {
    if (!this.consent) return false;
    return this.consent.categories[category] === true;
  }
}

// Export singleton instance
export const cookieConsent = new CookieConsentManager();

// Auto-initialize
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => cookieConsent.init());
  } else {
    cookieConsent.init();
  }
}

export default cookieConsent;
