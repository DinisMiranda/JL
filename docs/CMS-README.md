# Content Management System - Documentation

## Overview

This document describes the new Content Management System (CMS) features added to the João Lobo Advogados website. The system provides markdown-based content management, interactive components, and various user engagement features.

## Table of Contents

1. [Features Overview](#features-overview)
2. [File Structure](#file-structure)
3. [Configuration](#configuration)
4. [Content Management](#content-management)
5. [Component Usage](#component-usage)
6. [Integration Guide](#integration-guide)
7. [Customization](#customization)

---

## Features Overview

### ✅ Implemented Features

1. **Markdown-Based Content System**
   - Article management with front matter metadata
   - Automatic parsing and rendering
   - Support for images, links, code blocks, and more

2. **Interactive Components**
   - Testimonials Carousel
   - FAQ Accordion
   - Blog/News Section
   - Appointment Booking Form
   - Newsletter Signup
   - Document Download Area
   - Social Media Integration

3. **Reusable UI Components**
   - Card Components
   - Modal System
   - Loading States (Spinners, Skeletons)
   - Accordion
   - Carousel
   - Toast Notifications

4. **Practice Area Pages**
   - Detailed pages for each legal practice area
   - Markdown-based content
   - Structured information display

---

## File Structure

```
JL/
├── content/
│   ├── articles/           # Published articles
│   │   ├── social-democracia.md
│   │   ├── dr-carlos-pires.md
│   │   └── homenagem-pai.md
│   ├── news/              # News and blog posts
│   │   ├── reforma-processo-civil-2025.md
│   │   └── direitos-consumidor-2025.md
│   ├── practice-areas/    # Practice area details
│   │   └── direito-civil.md
│   ├── testimonials/      # Client testimonials
│   │   └── testimonials.json
│   └── faqs/             # Frequently asked questions
│       └── faqs.json
├── src/
│   ├── config/
│   │   └── cms-config.js  # Central configuration
│   ├── components/
│   │   └── components.js  # Reusable UI components
│   ├── utils/
│   │   └── markdown-parser.js  # Markdown utilities
│   ├── features/
│   │   ├── testimonials.js
│   │   ├── faq.js
│   │   ├── booking.js
│   │   ├── newsletter.js
│   │   ├── social-media.js
│   │   ├── blog.js
│   │   └── documents.js
│   └── main.js           # Application entry point
└── docs/
    └── CMS-README.md     # This file
```

---

## Configuration

### CMS Configuration (`src/config/cms-config.js`)

The central configuration file controls all CMS features:

```javascript
import CMS_CONFIG from './config/cms-config.js';

// Access configuration
const testimonialsConfig = CMS_CONFIG.testimonials;
const bookingConfig = CMS_CONFIG.booking;
```

#### Key Configuration Sections:

- **directories**: Content file locations
- **articles**: Article display settings
- **news**: Blog/news settings
- **testimonials**: Carousel settings
- **faqs**: Accordion settings
- **practiceAreas**: Legal practice areas
- **booking**: Appointment scheduling
- **newsletter**: Email subscription
- **socialMedia**: Social platform links

---

## Content Management

### 1. Creating Articles

Articles use markdown with YAML front matter:

```markdown
---
title: Your Article Title
author: João Lobo
date: 2025-01-15
tags: [tag1, tag2, tag3]
excerpt: Brief description for previews
featured: true
image: /images/article.jpg
---

# Article Content

Your markdown content here...
```

**File Location**: `content/articles/your-article.md`

### 2. Adding News Posts

Similar to articles, but stored in `content/news/`:

```markdown
---
title: Legal News Title
author: João Lobo
date: 2025-01-15
category: Direito Civil
tags: [legislation, updates]
excerpt: Brief description
featured: false
---

# News Content
```

### 3. Managing Testimonials

Edit `content/testimonials/testimonials.json`:

```json
{
  "id": "testimonial-1",
  "author": "Client Name",
  "role": "Service Type",
  "quote": "Testimonial text",
  "rating": 5,
  "date": "2024-10-15",
  "verified": true
}
```

### 4. Managing FAQs

Edit `content/faqs/faqs.json`:

```json
{
  "id": "faq-1",
  "category": "General",
  "question": "Your question?",
  "answer": "Your answer",
  "order": 1
}
```

### 5. Practice Area Pages

Create detailed pages in `content/practice-areas/`:

```markdown
---
id: direito-civil
title: Direito Civil
icon: ⚖️
color: #B91C1C
excerpt: Brief description
order: 1
---

# Detailed content about this practice area
```

---

## Component Usage

### Testimonials Carousel

```javascript
import { loadTestimonials } from './features/testimonials.js';

// Load testimonials into a container
await loadTestimonials('testimonials-section');
```

**HTML:**
```html
<section id="testimonials" class="py-16 bg-gray-50">
  <div id="testimonials-section"></div>
</section>
```

### FAQ Accordion

```javascript
import { loadFAQs } from './features/faq.js';

// Load FAQs with accordion
await loadFAQs('faq-section');
```

**HTML:**
```html
<section id="faqs" class="py-16">
  <div id="faq-section"></div>
</section>
```

### Blog Section

```javascript
import { loadBlogPosts } from './features/blog.js';

// Load 6 most recent posts
await loadBlogPosts('blog-section', 6);
```

**HTML:**
```html
<section id="blog" class="py-16">
  <div id="blog-section"></div>
</section>
```

### Booking Form

```javascript
import { createBookingForm, initBookingForm } from './features/booking.js';

// Create and append form
const bookingSection = createBookingForm();
document.body.appendChild(bookingSection);

// Initialize form handlers
initBookingForm();
```

### Newsletter

```javascript
import { createNewsletterSection, initNewsletterForm } from './features/newsletter.js';

// Create and append section
const newsletterSection = createNewsletterSection();
document.body.appendChild(newsletterSection);

// Initialize form
initNewsletterForm();
```

### Social Media

```javascript
import { createSocialMediaSection, addFloatingSocialSidebar } from './features/social-media.js';

// Add social media section
const socialSection = createSocialMediaSection();
document.body.appendChild(socialSection);

// Add floating sidebar
addFloatingSocialSidebar();
```

### Document Downloads

```javascript
import { createDocumentSection, loadDocuments } from './features/documents.js';

// Create section
const docsSection = createDocumentSection();
document.body.appendChild(docsSection);

// Load documents
await loadDocuments();
```

---

## Integration Guide

### Step 1: Import Main Module

In your main HTML file (`index.html`), add:

```html
<script type="module">
  import './src/main.js';
</script>
```

### Step 2: Add Section Containers

Add HTML containers where you want features to appear:

```html
<!-- Testimonials -->
<section id="testimonials" class="py-16 bg-gray-50">
  <div id="testimonials-section"></div>
</section>

<!-- FAQs -->
<section id="faqs" class="py-16">
  <div id="faq-section"></div>
</section>

<!-- Blog -->
<section id="blog" class="py-16">
  <div id="blog-section"></div>
</section>

<!-- Booking Form -->
<div id="booking-container"></div>

<!-- Newsletter -->
<div id="newsletter-container"></div>

<!-- Documents -->
<section id="documents" class="py-16">
  <div id="documents-grid"></div>
</section>
```

### Step 3: Initialize Features

The `main.js` file automatically initializes all features when the DOM is ready. Features are only initialized if their containers exist on the page.

---

## Customization

### Styling

All components use Tailwind CSS classes. Customize by:

1. **Modifying Tailwind Config** (`tailwind.config.js`)
2. **Overriding Component Styles** (create custom CSS file)
3. **Editing Component Templates** (in feature files)

### Configuration

Edit `src/config/cms-config.js` to customize:

- Content paths
- Display settings
- Business hours
- Social media links
- Feature toggles

### Adding New Features

1. Create feature file in `src/features/`
2. Export initialization function
3. Import in `src/main.js`
4. Add to initialization sequence

Example:

```javascript
// src/features/my-feature.js
export async function initMyFeature() {
  // Feature code
}

// src/main.js
import { initMyFeature } from './features/my-feature.js';

async function initializeApp() {
  await initMyFeature();
}
```

---

## Best Practices

### Content

- Keep markdown files organized by type
- Use descriptive filenames
- Include all required front matter fields
- Optimize images before uploading
- Write clear, concise excerpts

### Performance

- Use lazy loading for images
- Implement content caching
- Minimize markdown file sizes
- Optimize asset delivery

### Accessibility

- Include alt text for images
- Use semantic HTML
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper heading hierarchy

### Security

- Validate all form inputs
- Sanitize user-generated content
- Implement rate limiting
- Use HTTPS for all resources
- Keep dependencies updated

---

## Troubleshooting

### Issue: Features not loading

**Solution**: Check browser console for errors. Ensure:
- Container IDs match
- Files are in correct locations
- Modules are properly imported

### Issue: Markdown not rendering

**Solution**: Verify:
- Front matter syntax is correct
- File paths are accessible
- Markdown parser is included

### Issue: Forms not submitting

**Solution**: Check:
- EmailJS configuration
- Form field validation
- Network connectivity
- Console for error messages

---

## Support

For questions or issues:

- **Email**: joaojlobo@hotmail.com
- **Phone**: +351 915 964 547
- **Website**: https://joaoloboadvogados.pt

---

## License

© 2025 João Lobo Advogados. All rights reserved.
