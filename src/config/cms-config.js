/**
 * Content Management System Configuration
 * Centralized configuration for all content types and sources
 */

export const CMS_CONFIG = {
  // Content directories
  directories: {
    articles: '/content/articles',
    news: '/content/news',
    testimonials: '/content/testimonials',
    faqs: '/content/faqs',
    practiceAreas: '/content/practice-areas',
    documents: '/content/documents',
  },

  // Article configuration
  articles: {
    perPage: 10,
    excerptLength: 200,
    dateFormat: 'pt-PT',
    defaultAuthor: 'João Lobo',
    allowComments: false,
  },

  // News/Blog configuration
  news: {
    perPage: 6,
    excerptLength: 150,
    showReadingTime: true,
    categories: [
      'Direito Civil',
      'Direito Comercial',
      'Direito Penal',
      'Direito Internacional',
      'Direito da Família',
      'Direito Imobiliário',
      'Atualidades Jurídicas'
    ],
  },

  // Testimonials configuration
  testimonials: {
    autoplay: true,
    autoplayInterval: 6000,
    showRating: true,
    maxVisible: 3,
  },

  // FAQs configuration
  faqs: {
    allowMultipleOpen: false,
    categories: [
      'Geral',
      'Serviços',
      'Processos',
      'Honorários',
      'Agendamento'
    ],
  },

  // Practice areas configuration
  practiceAreas: {
    showDetailPages: true,
    showRelatedArticles: true,
    areas: [
      {
        id: 'direito-civil',
        title: 'Direito Civil',
        icon: '⚖️',
        color: '#B91C1C'
      },
      {
        id: 'direito-comercial',
        title: 'Direito Comercial',
        icon: '💼',
        color: '#c9a14a'
      },
      {
        id: 'direito-penal',
        title: 'Direito Penal',
        icon: '🔨',
        color: '#B91C1C'
      },
      {
        id: 'direito-internacional',
        title: 'Direito Internacional',
        icon: '🌍',
        color: '#c9a14a'
      },
      {
        id: 'direito-familia',
        title: 'Direito da Família',
        icon: '👨‍👩‍👧‍👦',
        color: '#B91C1C'
      },
      {
        id: 'direito-imobiliario',
        title: 'Direito Imobiliário',
        icon: '🏠',
        color: '#c9a14a'
      }
    ]
  },

  // Documents configuration
  documents: {
    allowedTypes: ['.pdf', '.doc', '.docx'],
    maxSizeKB: 10240, // 10MB
    categories: [
      'Formulários',
      'Modelos',
      'Informações Úteis',
      'Legislação'
    ],
  },

  // Booking configuration
  booking: {
    enableOnlineBooking: true,
    businessHours: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null }
    },
    appointmentDuration: 60, // minutes
    allowedDaysAhead: 30,
    holidays: [
      '2025-01-01', // New Year
      '2025-04-18', // Good Friday
      '2025-04-25', // Freedom Day
      '2025-05-01', // Labour Day
      '2025-06-10', // Portugal Day
      '2025-06-19', // Corpus Christi
      '2025-08-15', // Assumption
      '2025-10-05', // Republic Day
      '2025-11-01', // All Saints
      '2025-12-01', // Independence
      '2025-12-08', // Immaculate Conception
      '2025-12-25', // Christmas
    ]
  },

  // Newsletter configuration
  newsletter: {
    provider: 'emailjs', // or 'mailchimp', 'sendinblue', etc.
    doubleOptIn: true,
    listId: 'newsletter_subscribers',
    welcomeEmail: true,
  },

  // Social media configuration
  socialMedia: {
    platforms: [
      {
        name: 'Facebook',
        icon: 'facebook',
        url: 'https://facebook.com/joaoloboadvogados',
        enabled: true
      },
      {
        name: 'LinkedIn',
        icon: 'linkedin',
        url: 'https://linkedin.com/company/joaoloboadvogados',
        enabled: true
      },
      {
        name: 'Twitter',
        icon: 'twitter',
        url: 'https://twitter.com/jloboadvogados',
        enabled: false
      },
      {
        name: 'Instagram',
        icon: 'instagram',
        url: 'https://instagram.com/joaoloboadvogados',
        enabled: false
      }
    ],
    shareButtons: true,
    followButtons: true,
  },

  // Cache configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    strategies: {
      articles: 'cache-first',
      news: 'network-first',
      static: 'cache-first'
    }
  },

  // SEO configuration
  seo: {
    generateMetaTags: true,
    generateSchema: true,
    defaultImage: '/images/jl_pai.jpg',
    twitterCard: 'summary_large_image',
  }
};

// Helper functions
export function getContentPath(type) {
  return CMS_CONFIG.directories[type] || '/content';
}

export function getPracticeArea(id) {
  return CMS_CONFIG.practiceAreas.areas.find(area => area.id === id);
}

export function isBusinessDay(date) {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];

  // Check if weekend
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Check if holiday
  if (CMS_CONFIG.booking.holidays.includes(dateString)) {
    return false;
  }

  return true;
}

export function getBusinessHours(dayOfWeek) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[dayOfWeek];
  return CMS_CONFIG.booking.businessHours[dayName];
}

export default CMS_CONFIG;
