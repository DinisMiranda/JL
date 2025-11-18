# Quick Start Guide

This guide will help you quickly get started with the new CMS features for the João Lobo Advogados website.

## Prerequisites

- Basic knowledge of HTML, JavaScript, and Markdown
- Text editor (VS Code, Sublime, etc.)
- Web server (for development: `npm run dev` or use Vite)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Website**
   Open your browser to `http://localhost:3000`

## Adding Content

### 1. Add a New Article

Create a file in `content/articles/`:

```bash
# Example: content/articles/my-article.md
```

```markdown
---
title: My Article Title
author: João Lobo
date: 2025-01-15
tags: [law, guide]
excerpt: A brief description
featured: false
---

# Article Content

Your markdown content here...
```

### 2. Add a News Post

Create a file in `content/news/`:

```bash
# Example: content/news/legal-update-2025.md
```

```markdown
---
title: Legal Update 2025
author: João Lobo
date: 2025-01-15
category: Direito Civil
tags: [legislation]
excerpt: Latest legal changes
---

# News Content
```

### 3. Add a Testimonial

Edit `content/testimonials/testimonials.json`:

```json
{
  "id": "testimonial-new",
  "author": "Client Name",
  "role": "Service Area",
  "quote": "Excellent service!",
  "rating": 5,
  "date": "2025-01-15",
  "verified": true
}
```

### 4. Add an FAQ

Edit `content/faqs/faqs.json`:

```json
{
  "id": "faq-new",
  "category": "General",
  "question": "How do I...?",
  "answer": "You can...",
  "order": 11
}
```

## Using Features in HTML

### Option 1: Auto-Initialization (Recommended)

Simply add the container divs to your HTML:

```html
<!-- Add this to your HTML -->
<section id="testimonials" class="py-16 bg-gray-50">
  <div id="testimonials-section"></div>
</section>

<section id="faqs" class="py-16">
  <div id="faq-section"></div>
</section>

<section id="blog" class="py-16">
  <div id="blog-section"></div>
</section>

<!-- Import main.js -->
<script type="module" src="./src/main.js"></script>
```

The features will automatically initialize when the page loads!

### Option 2: Manual Initialization

```html
<script type="module">
  import { loadTestimonials } from './src/features/testimonials.js';
  import { loadFAQs } from './src/features/faq.js';

  // Load when ready
  document.addEventListener('DOMContentLoaded', async () => {
    await loadTestimonials('testimonials-section');
    await loadFAQs('faq-section');
  });
</script>
```

## Configuration

Edit `src/config/cms-config.js` to customize:

```javascript
export const CMS_CONFIG = {
  testimonials: {
    autoplay: true,
    autoplayInterval: 6000
  },
  news: {
    perPage: 6
  },
  booking: {
    appointmentDuration: 60,
    businessHours: {
      monday: { start: '09:00', end: '18:00' }
      // ...
    }
  }
  // ... more config
};
```

## Common Tasks

### Change Social Media Links

Edit `src/config/cms-config.js`:

```javascript
socialMedia: {
  platforms: [
    {
      name: 'Facebook',
      url: 'https://facebook.com/yourpage',
      enabled: true
    }
  ]
}
```

### Modify Business Hours

Edit `src/config/cms-config.js`:

```javascript
booking: {
  businessHours: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
    // ...
  }
}
```

### Add/Remove Practice Areas

Edit `src/config/cms-config.js`:

```javascript
practiceAreas: {
  areas: [
    {
      id: 'new-area',
      title: 'New Practice Area',
      icon: '⚖️',
      color: '#B91C1C'
    }
  ]
}
```

## Testing

1. **Test Locally**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Deployment

1. **Build the site**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder to your server**

3. **Ensure content files are accessible**
   - Upload `/content` directory
   - Verify file permissions

## Troubleshooting

### Content Not Loading

**Check:**
- Are files in the correct directories?
- Is the file path in the code correct?
- Are there any console errors?

### Forms Not Working

**Check:**
- EmailJS configuration in `script.js`
- Form field IDs match JavaScript
- Network connectivity

### Styles Not Applied

**Check:**
- Tailwind CSS is loaded
- Custom CSS files are linked
- Class names are correct

## Next Steps

1. ✅ Add your content (articles, news, testimonials)
2. ✅ Customize configuration
3. ✅ Test all features
4. ✅ Deploy to production

## Support

- 📧 Email: joaojlobo@hotmail.com
- 📞 Phone: +351 915 964 547
- 🌐 Website: https://joaoloboadvogados.pt

## Resources

- [Full Documentation](./CMS-README.md)
- [Integration Example](./INTEGRATION-EXAMPLE.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Happy Building! 🚀**
