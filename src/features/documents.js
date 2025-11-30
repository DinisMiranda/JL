/**
 * Document Download Feature
 * Manage and display downloadable documents
 */

import CMS_CONFIG from '../config/cms-config.js';

/**
 * Create document download section
 */
export function createDocumentSection() {
  const section = document.createElement('section');
  section.id = 'documents';
  section.className = 'py-16 md:py-24 px-4 bg-gray-50';

  section.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
          Documentos Úteis
        </h2>
        <p class="text-lg text-gray-600">
          Aceda a formulários, modelos e informações úteis
        </p>
      </div>

      <!-- Category filter -->
      <div class="mb-8 flex flex-wrap gap-2 justify-center">
        <button
          class="doc-filter-btn px-4 py-2 rounded-full border-2 transition-all duration-200 active bg-primary text-white border-primary"
          data-category="all"
        >
          Todos
        </button>
        ${CMS_CONFIG.documents.categories.map(category => `
          <button
            class="doc-filter-btn px-4 py-2 rounded-full border-2 border-gray-300 text-gray-700 hover:border-primary transition-all duration-200"
            data-category="${category}"
          >
            ${category}
          </button>
        `).join('')}
      </div>

      <div id="documents-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Documents will be loaded here -->
      </div>
    </div>
  `;

  return section;
}

/**
 * Load documents
 */
export async function loadDocuments() {
  // Sample documents - replace with actual data source
  const documents = [
    {
      id: 'form-01',
      title: 'Formulário de Procuração',
      category: 'Formulários',
      description: 'Modelo de procuração forense para representação legal',
      fileType: 'pdf',
      fileSize: '156 KB',
      downloadUrl: '/documents/procuracao.pdf',
      lastUpdated: '2025-01-10'
    },
    {
      id: 'form-02',
      title: 'Requerimento Genérico',
      category: 'Formulários',
      description: 'Modelo de requerimento para diversos fins processuais',
      fileType: 'docx',
      fileSize: '42 KB',
      downloadUrl: '/documents/requerimento.docx',
      lastUpdated: '2025-01-05'
    },
    {
      id: 'info-01',
      title: 'Guia de Direitos do Consumidor',
      category: 'Informações Úteis',
      description: 'Informação completa sobre direitos e garantias',
      fileType: 'pdf',
      fileSize: '2.3 MB',
      downloadUrl: '/documents/guia-consumidor.pdf',
      lastUpdated: '2024-12-20'
    },
    {
      id: 'model-01',
      title: 'Contrato de Arrendamento',
      category: 'Modelos',
      description: 'Modelo de contrato de arrendamento habitacional',
      fileType: 'docx',
      fileSize: '98 KB',
      downloadUrl: '/documents/contrato-arrendamento.docx',
      lastUpdated: '2024-12-15'
    },
    {
      id: 'leg-01',
      title: 'Código Civil Atualizado',
      category: 'Legislação',
      description: 'Versão consolidada do Código Civil Português',
      fileType: 'pdf',
      fileSize: '5.2 MB',
      downloadUrl: '/documents/codigo-civil.pdf',
      lastUpdated: '2025-01-01'
    },
    {
      id: 'model-02',
      title: 'Modelo de Queixa',
      category: 'Modelos',
      description: 'Modelo para apresentação de queixa criminal',
      fileType: 'docx',
      fileSize: '35 KB',
      downloadUrl: '/documents/modelo-queixa.docx',
      lastUpdated: '2024-11-30'
    }
  ];

  const grid = document.getElementById('documents-grid');
  if (!grid) return;

  // Clear grid
  grid.innerHTML = '';

  // Add document cards
  documents.forEach(doc => {
    const card = createDocumentCard(doc);
    grid.appendChild(card);
  });

  // Setup filters
  setupDocumentFilters(documents);

  return documents;
}

/**
 * Create document card
 */
function createDocumentCard(doc) {
  const card = document.createElement('div');
  card.className = 'document-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-primary';
  card.setAttribute('data-category', doc.category);

  const fileIcon = getFileIcon(doc.fileType);
  const fileTypeColor = getFileTypeColor(doc.fileType);

  card.innerHTML = `
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0 w-16 h-16 ${fileTypeColor} rounded-lg flex items-center justify-center">
        ${fileIcon}
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">
          ${doc.title}
        </h3>
        <span class="inline-block px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded mb-2">
          ${doc.category}
        </span>
      </div>
    </div>

    <p class="text-gray-600 text-sm mt-4 mb-4 line-clamp-2">
      ${doc.description}
    </p>

    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
      <span class="flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        ${doc.fileType.toUpperCase()}
      </span>
      <span>${doc.fileSize}</span>
    </div>

    <button
      onclick="downloadDocument('${doc.downloadUrl}', '${doc.title}')"
      class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Descarregar
    </button>

    <p class="text-xs text-gray-500 text-center mt-3">
      Atualizado em ${new Date(doc.lastUpdated).toLocaleDateString('pt-PT')}
    </p>
  `;

  return card;
}

/**
 * Get file icon
 */
function getFileIcon(fileType) {
  const icons = {
    pdf: '<svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path fill="#fff" d="M14 2v6h6"/></svg>',
    docx: '<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path fill="#fff" d="M14 2v6h6"/></svg>',
    doc: '<svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path fill="#fff" d="M14 2v6h6"/></svg>'
  };
  return icons[fileType] || icons.pdf;
}

/**
 * Get file type color
 */
function getFileTypeColor(fileType) {
  const colors = {
    pdf: 'bg-red-100',
    docx: 'bg-blue-100',
    doc: 'bg-blue-100'
  };
  return colors[fileType] || 'bg-gray-100';
}

/**
 * Setup document filters
 */
function setupDocumentFilters(documents) {
  const filterButtons = document.querySelectorAll('.doc-filter-btn');
  const cards = document.querySelectorAll('.document-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Update active button
      filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-primary', 'text-white', 'border-primary');
        btn.classList.add('border-gray-300', 'text-gray-700');
      });
      button.classList.add('active', 'bg-primary', 'text-white', 'border-primary');
      button.classList.remove('border-gray-300', 'text-gray-700');

      // Filter cards
      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Download document
 */
window.downloadDocument = function(url, filename) {
  // Track download
  console.log('Downloading:', filename);

  // Create temporary link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Show notification
  showDownloadNotification(filename);
};

/**
 * Show download notification
 */
function showDownloadNotification(filename) {
  // You can use the Toast component here
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in';
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>Download iniciado: ${filename}</span>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Export
export default {
  createDocumentSection,
  loadDocuments
};
