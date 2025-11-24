/**
 * Markdown Parser and Content Management Utilities
 * Lightweight markdown parser with metadata support
 */

/**
 * Parse markdown metadata (front matter)
 * @param {string} content - Markdown content with front matter
 * @returns {Object} - { metadata, content }
 */
export function parseMarkdownMetadata(content) {
  const metadataRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(metadataRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const [, metadataString, markdownContent] = match;
  const metadata = {};

  // Parse YAML-like metadata
  metadataString.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();

      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        metadata[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''));
      } else {
        // Remove quotes from string values
        metadata[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });

  return { metadata, content: markdownContent.trim() };
}

/**
 * Simple markdown to HTML converter
 * Supports: headers, bold, italic, links, lists, blockquotes, code
 * @param {string} markdown - Markdown text
 * @returns {string} - HTML string
 */
export function markdownToHtml(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Headers (h1-h6)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-semibold text-gray-900 mb-2">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-lg font-semibold text-gray-900 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-xl font-semibold text-gray-900 mb-3">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-2xl font-serif font-semibold text-primary mb-3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-3xl font-serif font-bold text-primary mb-4">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-4xl font-serif font-bold text-gray-900 mb-6">$1</h1>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-secondary pl-4 italic text-primary mb-4 text-lg">$1</blockquote>');

  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-secondary underline transition-colors duration-200">$1</a>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md my-4" loading="lazy" />');

  // Unordered lists
  html = html.replace(/^\*\s+(.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/^-\s+(.+)$/gm, '<li class="ml-4">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4">$1</li>');

  // Wrap lists
  html = html.replace(/(<li[\s\S]*?<\/li>)/g, function(match) {
    return '<ul class="list-disc space-y-2 text-gray-700 mb-4">' + match + '</ul>';
  });

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-300" />');

  // Paragraphs (wrap non-HTML lines)
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    // Don't wrap if already HTML or empty
    if (!trimmed || trimmed.startsWith('<') || trimmed.endsWith('>')) {
      return line;
    }
    return `<p class="text-gray-700 leading-relaxed mb-4">${trimmed}</p>`;
  });

  html = processedLines.join('\n');

  // Clean up multiple consecutive list wrappers
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '');

  return html;
}

/**
 * Load markdown content from a file path
 * @param {string} filePath - Path to markdown file
 * @returns {Promise<Object>} - { metadata, content, html }
 */
export async function loadMarkdownFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}`);
    }

    const content = await response.text();
    const { metadata, content: markdownContent } = parseMarkdownMetadata(content);
    const html = markdownToHtml(markdownContent);

    return {
      metadata,
      content: markdownContent,
      html,
      filePath
    };
  } catch (error) {
    console.error('Error loading markdown file:', error);
    throw error;
  }
}

/**
 * Load all markdown files from a directory
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Promise<Array<Object>>} - Array of parsed markdown objects
 */
export async function loadMarkdownFiles(filePaths) {
  try {
    const files = await Promise.all(
      filePaths.map(path => loadMarkdownFile(path))
    );

    // Sort by date (newest first) if metadata has date
    return files.sort((a, b) => {
      const dateA = a.metadata.date ? new Date(a.metadata.date) : new Date(0);
      const dateB = b.metadata.date ? new Date(b.metadata.date) : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error loading markdown files:', error);
    return [];
  }
}

/**
 * Filter content by tag
 * @param {Array<Object>} content - Array of content objects with metadata
 * @param {string} tag - Tag to filter by
 * @returns {Array<Object>} - Filtered content
 */
export function filterByTag(content, tag) {
  return content.filter(item => {
    const tags = item.metadata.tags || [];
    return tags.includes(tag);
  });
}

/**
 * Search content
 * @param {Array<Object>} content - Array of content objects
 * @param {string} query - Search query
 * @returns {Array<Object>} - Matching content
 */
export function searchContent(content, query) {
  const lowerQuery = query.toLowerCase();

  return content.filter(item => {
    const titleMatch = item.metadata.title?.toLowerCase().includes(lowerQuery);
    const contentMatch = item.content?.toLowerCase().includes(lowerQuery);
    const authorMatch = item.metadata.author?.toLowerCase().includes(lowerQuery);
    const tagsMatch = item.metadata.tags?.some(tag =>
      tag.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || contentMatch || authorMatch || tagsMatch;
  });
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @param {string} locale - Locale (default: pt-PT)
 * @returns {string} - Formatted date
 */
export function formatDate(dateString, locale = 'pt-PT') {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Calculate reading time
 * @param {string} content - Text content
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {number} - Reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 200) {
  if (!content) return 0;

  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return minutes;
}

/**
 * Generate content slug from title
 * @param {string} title - Content title
 * @returns {string} - URL-friendly slug
 */
export function generateSlug(title) {
  if (!title) return '';

  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Content cache for performance
 */
class ContentCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export singleton cache instance
export const contentCache = new ContentCache();

/**
 * Content manager class for coordinating content operations
 */
export class ContentManager {
  constructor() {
    this.cache = contentCache;
    this.observers = [];
  }

  /**
   * Subscribe to content changes
   */
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify observers of content changes
   */
  notify(event, data) {
    this.observers.forEach(callback => callback(event, data));
  }

  /**
   * Load content with caching
   */
  async loadContent(key, loader) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Load fresh content
    const content = await loader();
    this.cache.set(key, content);
    this.notify('contentLoaded', { key, content });

    return content;
  }

  /**
   * Clear all cached content
   */
  clearCache() {
    this.cache.clear();
    this.notify('cacheCleared', {});
  }
}

// Export singleton content manager
export const contentManager = new ContentManager();
