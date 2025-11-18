/**
 * Blog/News Feature
 * Display and manage blog posts and news articles
 */

import { loadMarkdownFiles, formatDate, calculateReadingTime, generateSlug } from '../utils/markdown-parser.js';
import { createCard, Modal } from '../components/components.js';
import { createShareButtons } from './social-media.js';
import CMS_CONFIG from '../config/cms-config.js';

/**
 * Load and display blog posts
 */
export async function loadBlogPosts(containerId = 'blog-section', limit = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Blog container #${containerId} not found`);
    return;
  }

  try {
    // Define news article paths
    const articlePaths = [
      '/content/news/reforma-processo-civil-2025.md',
      '/content/news/direitos-consumidor-2025.md',
      // Add more paths as needed
    ];

    // Load all articles
    const articles = await loadMarkdownFiles(articlePaths);

    // Apply limit if specified
    const displayArticles = limit ? articles.slice(0, limit) : articles;

    // Create grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

    // Add article cards
    displayArticles.forEach(article => {
      const card = createBlogCard(article);
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);

    // Add "Load More" button if there are more articles
    if (limit && articles.length > limit) {
      const loadMoreBtn = document.createElement('div');
      loadMoreBtn.className = 'text-center mt-12';
      loadMoreBtn.innerHTML = `
        <button
          id="load-more-btn"
          class="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          data-loaded="${limit}"
          data-total="${articles.length}"
        >
          Ver Mais Artigos
        </button>
      `;
      container.appendChild(loadMoreBtn);

      // Add click handler
      const btn = loadMoreBtn.querySelector('#load-more-btn');
      btn.addEventListener('click', () => loadMoreArticles(articles, grid, btn));
    }

    return articles;

  } catch (error) {
    console.error('Error loading blog posts:', error);
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-600">Não foi possível carregar os artigos no momento.</p>
      </div>
    `;
  }
}

/**
 * Create blog card
 */
function createBlogCard(article) {
  const { metadata, html } = article;
  const readingTime = calculateReadingTime(article.content);
  const slug = generateSlug(metadata.title);

  const card = document.createElement('article');
  card.className = 'blog-card bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 cursor-pointer';
  card.setAttribute('data-slug', slug);

  card.innerHTML = `
    ${metadata.image ? `
      <div class="aspect-video overflow-hidden">
        <img
          src="${metadata.image}"
          alt="${metadata.title}"
          class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
    ` : ''}

    <div class="p-6">
      ${metadata.category ? `
        <span class="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full mb-3">
          ${metadata.category}
        </span>
      ` : ''}

      ${metadata.featured ? `
        <span class="inline-block px-3 py-1 text-xs font-semibold text-secondary border border-secondary rounded-full mb-3 ml-2">
          Destaque
        </span>
      ` : ''}

      <h3 class="text-xl font-serif font-semibold text-gray-900 mb-3 hover:text-primary transition-colors">
        ${metadata.title}
      </h3>

      <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          ${formatDate(metadata.date)}
        </span>
        ${CMS_CONFIG.news.showReadingTime ? `
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${readingTime} min
          </span>
        ` : ''}
      </div>

      <p class="text-gray-700 leading-relaxed mb-4">
        ${metadata.excerpt || html.substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
      </p>

      <div class="flex items-center justify-between">
        <button
          class="read-more-btn inline-flex items-center text-primary font-semibold hover:text-secondary transition-colors duration-200"
          data-article-slug="${slug}"
        >
          Ler Artigo
          <svg class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        ${metadata.author ? `
          <span class="text-sm text-gray-600">Por ${metadata.author}</span>
        ` : ''}
      </div>
    </div>
  `;

  // Add click handler
  card.addEventListener('click', (e) => {
    if (!e.target.closest('button')) {
      openArticleModal(article);
    }
  });

  const readMoreBtn = card.querySelector('.read-more-btn');
  readMoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openArticleModal(article);
  });

  return card;
}

/**
 * Open article in modal
 */
function openArticleModal(article) {
  const { metadata, html } = article;
  const readingTime = calculateReadingTime(article.content);

  const modal = new Modal({
    id: 'article-modal',
    title: metadata.title,
    size: 'large',
    content: `
      <div class="prose prose-lg max-w-none">
        <div class="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            ${formatDate(metadata.date)}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${readingTime} min de leitura
          </span>
          ${metadata.author ? `
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ${metadata.author}
            </span>
          ` : ''}
        </div>

        ${metadata.tags && metadata.tags.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-6">
            ${metadata.tags.map(tag => `
              <span class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                #${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}

        ${html}

        <div class="mt-8 pt-6 border-t border-gray-200">
          ${createShareButtons(window.location.href, metadata.title)}
        </div>
      </div>
    `,
    showCloseButton: true,
    closeOnBackdrop: true
  });

  modal.open();
}

/**
 * Load more articles
 */
function loadMoreArticles(allArticles, grid, button) {
  const loaded = parseInt(button.getAttribute('data-loaded'));
  const loadMore = 3;
  const newLoaded = Math.min(loaded + loadMore, allArticles.length);

  // Add new cards
  for (let i = loaded; i < newLoaded; i++) {
    const card = createBlogCard(allArticles[i]);
    grid.appendChild(card);
  }

  // Update button
  button.setAttribute('data-loaded', newLoaded);

  if (newLoaded >= allArticles.length) {
    button.style.display = 'none';
  }
}

/**
 * Create blog section HTML
 */
export function createBlogSection() {
  const section = document.createElement('section');
  section.id = 'blog';
  section.className = 'py-16 md:py-24 px-4 bg-white';

  section.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-4">
          Notícias e Atualidades Jurídicas
        </h2>
        <p class="text-lg text-gray-600">
          Mantenha-se informado sobre as últimas novidades do direito
        </p>
      </div>

      <div id="blog-section" aria-live="polite">
        <div class="text-center py-12">
          <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-600">A carregar artigos...</p>
        </div>
      </div>
    </div>
  `;

  return section;
}

/**
 * Search blog posts
 */
export function addBlogSearch(container) {
  const searchDiv = document.createElement('div');
  searchDiv.className = 'mb-8';
  searchDiv.innerHTML = `
    <div class="max-w-2xl mx-auto relative">
      <input
        type="search"
        id="blog-search"
        placeholder="Procurar artigos..."
        class="w-full px-6 py-4 pl-14 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
      />
      <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  `;

  container.prepend(searchDiv);
}

// Export
export default {
  loadBlogPosts,
  createBlogSection,
  addBlogSearch
};
