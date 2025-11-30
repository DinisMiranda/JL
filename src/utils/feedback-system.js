/**
 * User Feedback System
 * Error reporting, satisfaction surveys, and accessibility feedback
 */

/**
 * Feedback configuration
 */
const FEEDBACK_CONFIG = {
  enabled: true,
  endpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/feedback`,
  showAfterSeconds: 30,
  showAfterScrollPercent: 50,
  maxSubmissionsPerSession: 3
};

/**
 * Feedback types
 */
export const FeedbackType = {
  ERROR_REPORT: 'error_report',
  SATISFACTION: 'satisfaction',
  ACCESSIBILITY: 'accessibility',
  GENERAL: 'general',
  BUG: 'bug',
  FEATURE_REQUEST: 'feature_request'
};

/**
 * Feedback Store
 */
class FeedbackStore {
  constructor() {
    this.submissions = [];
    this.sessionKey = 'feedback_submissions';
    this.loadSubmissions();
  }

  loadSubmissions() {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      this.submissions = stored ? JSON.parse(stored) : [];
    } catch (error) {
      this.submissions = [];
    }
  }

  saveSubmissions() {
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.submissions));
    } catch (error) {
      console.error('Failed to save feedback submissions:', error);
    }
  }

  add(feedback) {
    this.submissions.push({
      ...feedback,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    });
    this.saveSubmissions();
  }

  getCount() {
    return this.submissions.length;
  }

  canSubmit() {
    return this.getCount() < FEEDBACK_CONFIG.maxSubmissionsPerSession;
  }

  generateId() {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const feedbackStore = new FeedbackStore();

/**
 * Error Report Form
 */
export class ErrorReportForm {
  constructor() {
    this.form = null;
  }

  /**
   * Show error report form
   */
  show(errorDetails = {}) {
    if (!feedbackStore.canSubmit()) {
      alert('Limite de envios atingido para esta sessão');
      return;
    }

    this.create(errorDetails);
    this.form.showModal();
  }

  /**
   * Create form
   */
  create(errorDetails) {
    // Remove existing form
    const existing = document.getElementById('error-report-dialog');
    if (existing) {
      existing.remove();
    }

    const dialog = document.createElement('dialog');
    dialog.id = 'error-report-dialog';
    dialog.className = 'feedback-dialog';

    dialog.innerHTML = `
      <div class="feedback-dialog-content">
        <div class="feedback-dialog-header">
          <h2>Reportar Erro</h2>
          <button type="button" class="dialog-close" aria-label="Fechar">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form id="error-report-form" class="feedback-form">
          <p class="feedback-intro">
            Ajude-nos a melhorar reportando erros ou problemas que encontrou.
          </p>

          <div class="form-group">
            <label for="error-type">Tipo de Problema *</label>
            <select id="error-type" name="type" required>
              <option value="">Selecione...</option>
              <option value="page_error">Erro na Página</option>
              <option value="form_error">Problema com Formulário</option>
              <option value="display_error">Problema de Visualização</option>
              <option value="performance">Desempenho Lento</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div class="form-group">
            <label for="error-description">Descrição do Problema *</label>
            <textarea
              id="error-description"
              name="description"
              rows="4"
              required
              placeholder="Descreva o que aconteceu..."></textarea>
          </div>

          <div class="form-group">
            <label for="error-steps">Passos para Reproduzir (opcional)</label>
            <textarea
              id="error-steps"
              name="steps"
              rows="3"
              placeholder="1. &#10;2. &#10;3. "></textarea>
          </div>

          <div class="form-group">
            <label for="error-expected">Resultado Esperado (opcional)</label>
            <input
              type="text"
              id="error-expected"
              name="expected"
              placeholder="O que esperava que acontecesse?">
          </div>

          <div class="form-group">
            <label for="error-email">Email de Contacto (opcional)</label>
            <input
              type="email"
              id="error-email"
              name="email"
              placeholder="para atualizações sobre este problema">
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="include_details" checked>
              <span>Incluir detalhes técnicos (navegador, URL, etc.)</span>
            </label>
          </div>

          ${errorDetails.message ? `
            <div class="error-context">
              <strong>Contexto do Erro:</strong>
              <code>${this.escapeHtml(errorDetails.message)}</code>
            </div>
          ` : ''}

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Enviar Relatório
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(dialog);
    this.form = dialog;

    // Add styles
    this.injectStyles();

    // Add event listeners
    this.attachListeners(errorDetails);
  }

  /**
   * Attach event listeners
   */
  attachListeners(errorDetails) {
    // Close button
    const closeBtn = this.form.querySelector('.dialog-close');
    closeBtn.addEventListener('click', () => this.close());

    // Cancel button
    const cancelBtn = this.form.querySelector('[data-action="cancel"]');
    cancelBtn.addEventListener('click', () => this.close());

    // Form submission
    const form = this.form.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submit(form, errorDetails);
    });

    // Close on backdrop click
    this.form.addEventListener('click', (e) => {
      if (e.target === this.form) {
        this.close();
      }
    });

    // ESC key
    this.form.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Submit form
   */
  async submit(form, errorDetails) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'A enviar...';

    try {
      const feedback = {
        type: FeedbackType.ERROR_REPORT,
        errorType: formData.get('type'),
        description: formData.get('description'),
        steps: formData.get('steps'),
        expected: formData.get('expected'),
        email: formData.get('email'),
        includeDetails: formData.get('include_details') === 'on',
        context: formData.get('include_details') === 'on' ? {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          errorDetails
        } : null
      };

      // Send to server
      await this.sendFeedback(feedback);

      // Store locally
      feedbackStore.add(feedback);

      // Show success
      this.showSuccess();

    } catch (error) {
      console.error('Failed to submit error report:', error);
      alert('Erro ao enviar relatório. Por favor, tente novamente.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Relatório';
    }
  }

  /**
   * Send feedback to server
   */
  async sendFeedback(feedback) {
    const response = await fetch(FEEDBACK_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedback)
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback');
    }

    return response.json();
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.form.querySelector('.feedback-dialog-content').innerHTML = `
      <div class="feedback-success">
        <div class="success-icon">✓</div>
        <h2>Relatório Enviado!</h2>
        <p>Obrigado pelo seu feedback. Iremos analisar o problema reportado.</p>
        <button type="button" class="btn btn-primary" onclick="this.closest('dialog').close()">
          Fechar
        </button>
      </div>
    `;

    setTimeout(() => this.close(), 3000);
  }

  /**
   * Close dialog
   */
  close() {
    if (this.form) {
      this.form.close();
      setTimeout(() => this.form.remove(), 300);
    }
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Inject styles
   */
  injectStyles() {
    if (document.getElementById('feedback-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'feedback-styles';
    style.textContent = `
      .feedback-dialog {
        border: none;
        border-radius: 12px;
        padding: 0;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .feedback-dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }

      .feedback-dialog-content {
        padding: 0;
      }

      .feedback-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .feedback-dialog-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
      }

      .dialog-close {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        transition: background-color 0.2s;
      }

      .dialog-close:hover {
        background-color: #f3f4f6;
      }

      .feedback-form {
        padding: 1.5rem;
      }

      .feedback-intro {
        color: #666;
        margin: 0 0 1.5rem 0;
        font-size: 0.9375rem;
      }

      .form-group {
        margin-bottom: 1.25rem;
      }

      .form-group label {
        display: block;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
        font-size: 0.9375rem;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.9375rem;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        font-weight: normal;
      }

      .checkbox-label input[type="checkbox"] {
        width: auto;
        margin-top: 0.25rem;
      }

      .error-context {
        background: #fef3c7;
        border-left: 3px solid #f59e0b;
        padding: 1rem;
        margin: 1rem 0;
        font-size: 0.875rem;
      }

      .error-context code {
        display: block;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: white;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.8125rem;
        word-break: break-word;
      }

      .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      .btn {
        padding: 0.625rem 1.25rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9375rem;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover {
        background: #2563eb;
      }

      .btn-primary:disabled {
        background: #93c5fd;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .btn-secondary:hover {
        background: #e5e7eb;
      }

      .feedback-success {
        padding: 3rem 2rem;
        text-align: center;
      }

      .success-icon {
        width: 80px;
        height: 80px;
        background: #10b981;
        color: white;
        font-size: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
      }

      .feedback-success h2 {
        font-size: 1.75rem;
        color: #1a1a1a;
        margin-bottom: 0.75rem;
      }

      .feedback-success p {
        color: #666;
        margin-bottom: 2rem;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Satisfaction Survey
 */
export class SatisfactionSurvey {
  constructor() {
    this.shown = false;
    this.triggers = {
      timeOnPage: FEEDBACK_CONFIG.showAfterSeconds * 1000,
      scrollPercent: FEEDBACK_CONFIG.showAfterScrollPercent
    };
  }

  /**
   * Initialize survey triggers
   */
  init() {
    // Time-based trigger
    setTimeout(() => {
      if (!this.shown && feedbackStore.canSubmit()) {
        this.checkTriggers();
      }
    }, this.triggers.timeOnPage);

    // Scroll-based trigger
    window.addEventListener('scroll', () => {
      if (!this.shown && feedbackStore.canSubmit()) {
        this.checkTriggers();
      }
    });
  }

  /**
   * Check if triggers are met
   */
  checkTriggers() {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;

    if (scrollPercent >= this.triggers.scrollPercent) {
      this.show();
    }
  }

  /**
   * Show survey
   */
  show() {
    if (this.shown) return;
    this.shown = true;

    const container = document.createElement('div');
    container.id = 'satisfaction-survey';
    container.className = 'satisfaction-survey';

    container.innerHTML = `
      <div class="survey-content">
        <button class="survey-close" aria-label="Fechar">×</button>
        <h3>Como está a sua experiência?</h3>
        <p>Ajude-nos a melhorar com o seu feedback</p>

        <div class="rating-buttons">
          <button data-rating="1" aria-label="Muito insatisfeito">😞</button>
          <button data-rating="2" aria-label="Insatisfeito">🙁</button>
          <button data-rating="3" aria-label="Neutro">😐</button>
          <button data-rating="4" aria-label="Satisfeito">🙂</button>
          <button data-rating="5" aria-label="Muito satisfeito">😄</button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Add event listeners
    container.querySelector('.survey-close').addEventListener('click', () => {
      container.remove();
    });

    container.querySelectorAll('[data-rating]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        this.submitRating(rating);
        container.remove();
      });
    });

    // Inject styles
    this.injectStyles();
  }

  /**
   * Submit rating
   */
  async submitRating(rating) {
    const feedback = {
      type: FeedbackType.SATISFACTION,
      rating,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(FEEDBACK_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      feedbackStore.add(feedback);

      // Show thank you message
      this.showThankYou();

    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  }

  /**
   * Show thank you message
   */
  showThankYou() {
    const message = document.createElement('div');
    message.className = 'survey-thank-you';
    message.textContent = 'Obrigado pelo seu feedback!';
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 3000);
  }

  /**
   * Inject styles
   */
  injectStyles() {
    if (document.getElementById('survey-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'survey-styles';
    style.textContent = `
      .satisfaction-survey {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        padding: 1.5rem;
        max-width: 320px;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
      }

      @keyframes slideInUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .survey-content {
        position: relative;
      }

      .survey-close {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #999;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .survey-close:hover {
        color: #333;
      }

      .satisfaction-survey h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        color: #1a1a1a;
      }

      .satisfaction-survey p {
        margin: 0 0 1rem 0;
        font-size: 0.875rem;
        color: #666;
      }

      .rating-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
      }

      .rating-buttons button {
        background: none;
        border: 2px solid #e5e7eb;
        font-size: 2rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .rating-buttons button:hover {
        transform: scale(1.1);
        border-color: #3b82f6;
      }

      .survey-thank-you {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
      }

      @media (max-width: 640px) {
        .satisfaction-survey {
          left: 20px;
          right: 20px;
          max-width: none;
        }

        .survey-thank-you {
          left: 20px;
          right: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Accessibility Feedback Widget
 */
export class AccessibilityFeedback {
  /**
   * Show accessibility feedback form
   */
  show() {
    const reportForm = new ErrorReportForm();
    reportForm.create({
      type: FeedbackType.ACCESSIBILITY,
      message: 'Problema de Acessibilidade'
    });

    // Customize for accessibility
    const dialog = document.getElementById('error-report-dialog');
    const header = dialog.querySelector('h2');
    header.textContent = 'Reportar Problema de Acessibilidade';

    const intro = dialog.querySelector('.feedback-intro');
    intro.textContent = 'Ajude-nos a tornar este website mais acessível para todos. Descreva qualquer dificuldade que encontrou.';

    const typeSelect = dialog.querySelector('#error-type');
    typeSelect.innerHTML = `
      <option value="">Selecione...</option>
      <option value="keyboard">Navegação por Teclado</option>
      <option value="screen_reader">Leitor de Ecrã</option>
      <option value="contrast">Contraste de Cores</option>
      <option value="text_size">Tamanho do Texto</option>
      <option value="captions">Legendas/Transcrições</option>
      <option value="forms">Formulários</option>
      <option value="other">Outro</option>
    `;

    dialog.showModal();
  }
}

/**
 * Initialize feedback system
 */
export function initFeedbackSystem(config = {}) {
  Object.assign(FEEDBACK_CONFIG, config);

  const errorReportForm = new ErrorReportForm();
  const satisfactionSurvey = new SatisfactionSurvey();
  const accessibilityFeedback = new AccessibilityFeedback();

  // Initialize satisfaction survey
  if (FEEDBACK_CONFIG.enabled) {
    satisfactionSurvey.init();
  }

  return {
    errorReportForm,
    satisfactionSurvey,
    accessibilityFeedback,
    feedbackStore
  };
}

// Export instances
export const errorReportForm = new ErrorReportForm();
export const satisfactionSurvey = new SatisfactionSurvey();
export const accessibilityFeedback = new AccessibilityFeedback();
