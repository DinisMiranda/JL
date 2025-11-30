# SEO and Performance Optimization Guide

## Overview

This document outlines all the SEO and performance optimizations implemented for the João Lobo Advogados website.

## Table of Contents

1. [SEO Optimizations](#seo-optimizations)
2. [Performance Optimizations](#performance-optimizations)
3. [Testing and Validation](#testing-and-validation)
4. [Maintenance](#maintenance)

---

## SEO Optimizations

### 1. Meta Tags

#### Basic Meta Tags
- **Title**: Optimized with primary keywords and location
- **Description**: Compelling 155-character description with key services
- **Keywords**: Targeted keywords for law firm services in Braga
- **Author**: Brand attribution
- **Robots**: Configured for optimal crawling and indexing
- **Canonical URL**: Prevents duplicate content issues

#### Open Graph Tags (Social Media)
- **og:type**: Defined as "website"
- **og:title**: Optimized for social sharing
- **og:description**: Engaging description for social media
- **og:image**: Professional image for social media previews (1200x630px recommended)
- **og:locale**: Set to Portuguese (pt_PT)
- **og:site_name**: Consistent branding

#### Twitter Card Tags
- **twitter:card**: Large image card for better engagement
- **twitter:title**: Optimized title for Twitter
- **twitter:description**: Compelling description
- **twitter:image**: High-quality preview image

#### Geo Tags
- Location-based tags for local SEO (Braga, Portugal)
- Coordinates for precise location targeting
- ICBM format for additional geo-targeting

### 2. Structured Data (JSON-LD)

Implemented comprehensive Schema.org structured data:

#### LegalService Schema
- Organization details (name, description, founding date)
- Contact information (phone, email, address)
- Geographic coordinates
- Service catalog with all practice areas
- Business hours and service areas

#### Person Schema
- Lawyer profile (Dr. João Lobo)
- Professional qualifications
- Educational background
- Areas of expertise

#### WebSite Schema
- Website information
- Language specification
- Publisher details

#### BreadcrumbList Schema
- Navigation hierarchy
- Improved search result display
- Better user experience in SERPs

### 3. Sitemap.xml

Located at: `/public/sitemap.xml`

**Features:**
- All main pages and sections
- Image sitemap included
- Priority and change frequency specified
- Last modification dates
- Optimized for search engine crawling

**Update Frequency:**
- Homepage: Monthly
- Practice Areas: Monthly
- Team Section: Monthly
- Publications: Quarterly
- Contact: Yearly

### 4. Robots.txt

Located at: `/public/robots.txt`

**Configuration:**
- Allows all search engine crawlers
- Sitemap reference included
- Spam bot blocking
- Crawl-delay for aggressive bots
- Future-ready with admin path blocking

---

## Performance Optimizations

### 1. Image Optimization

#### Lazy Loading
- All non-critical images use `loading="lazy"`
- Hero image uses `loading="eager"` for LCP optimization
- Explicit width and height attributes to prevent layout shift

#### Best Practices
- Optimized alt text for accessibility and SEO
- Proper image dimensions specified
- Consider using WebP format for better compression

### 2. Resource Loading

#### Preconnect and DNS Prefetch
```html
<link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin />
<link rel="dns-prefetch" href="https://cdn.tailwindcss.com" />
```

**Benefits:**
- Faster connection to CDN resources
- Reduced DNS lookup time
- Improved Time to First Byte (TTFB)

### 3. Build Optimizations (Vite)

#### Minification
- **Terser**: Advanced JavaScript minification
  - Console.log removal in production
  - Dead code elimination
  - Variable name mangling

#### CSS Optimization
- **cssnano**: Production CSS minification
- **CSS Code Splitting**: Separate CSS files for better caching
- **Tailwind Purging**: Automatic removal of unused CSS

#### Compression
- **Gzip**: Standard compression (files > 10kb)
- **Brotli**: Superior compression for modern browsers
- Both formats generated during build

#### Code Splitting
- Vendor bundle separation
- Optimized chunk naming with content hashes
- Better browser caching strategy

#### Asset Optimization
- Inline small assets (< 4kb)
- Organized asset folders by type
- Content-based hash naming for cache busting

### 4. Bundle Size Optimization

**Strategies:**
- Manual chunk splitting for vendor code
- Tree-shaking for unused code removal
- Dynamic imports for code splitting (future enhancement)
- Asset size warnings at 1000kb threshold

### 5. Critical CSS (Recommended Implementation)

While not fully implemented due to CDN Tailwind usage, consider:
- Moving to local Tailwind for production
- Implementing critical CSS extraction
- Inlining above-the-fold CSS

---

## Testing and Validation

### SEO Testing

#### 1. Google Rich Results Test
```
https://search.google.com/test/rich-results
```
- Test URL after deployment
- Verify structured data is valid
- Check for errors or warnings

#### 2. Google Search Console
After deployment:
1. Submit sitemap: `https://yourdomain.com/sitemap.xml`
2. Request indexing for important pages
3. Monitor Core Web Vitals
4. Check mobile usability
5. Review search analytics

#### 3. Schema Markup Validator
```
https://validator.schema.org/
```
- Paste the page source
- Verify all structured data

### Performance Testing

#### 1. Google PageSpeed Insights
```
https://pagespeed.web.dev/
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

#### 2. GTmetrix
```
https://gtmetrix.com/
```

**Monitor:**
- Fully Loaded Time
- Total Page Size
- Number of Requests
- Waterfall analysis

#### 3. WebPageTest
```
https://www.webpagetest.org/
```

**Key Metrics:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

### Lighthouse Audit

Run locally:
```bash
npm install -g lighthouse
lighthouse https://yourdomain.com --view
```

Or use Chrome DevTools > Lighthouse tab

---

## Maintenance

### Regular Tasks

#### Monthly
- [ ] Update sitemap with new content
- [ ] Review and update meta descriptions
- [ ] Check broken links
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Review search queries and impressions

#### Quarterly
- [ ] Run full SEO audit
- [ ] Update structured data if services change
- [ ] Review and optimize images
- [ ] Check competitor rankings
- [ ] Update content for freshness

#### Annually
- [ ] Comprehensive SEO strategy review
- [ ] Performance benchmark testing
- [ ] Update schema.org types if needed
- [ ] Review and update keywords
- [ ] Analyze traffic patterns and adjust strategy

### Image Optimization Workflow

1. **Before Adding Images:**
   - Resize to appropriate dimensions
   - Compress using tools like TinyPNG or Squoosh
   - Consider WebP format with PNG/JPG fallback
   - Add descriptive alt text

2. **File Naming:**
   - Use descriptive names: `joao-lobo-advogado.jpg`
   - Include keywords where appropriate
   - Use hyphens, not underscores

### Content Updates

When adding new content:
1. Update sitemap.xml with new pages/sections
2. Add structured data if applicable
3. Update meta descriptions
4. Ensure proper heading hierarchy (H1 → H2 → H3)
5. Add internal links from existing pages
6. Test mobile responsiveness

---

## Performance Checklist

### Before Deployment

- [ ] Run `npm run build`
- [ ] Check build output for warnings
- [ ] Verify compressed file sizes
- [ ] Test production build locally with `npm run preview`
- [ ] Run Lighthouse audit
- [ ] Check all images have lazy loading
- [ ] Verify meta tags are correct
- [ ] Test sitemap.xml accessibility
- [ ] Validate robots.txt

### After Deployment

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Analytics (if not already done)
- [ ] Monitor initial Core Web Vitals
- [ ] Test social media sharing (Open Graph)
- [ ] Verify structured data in Google Rich Results Test
- [ ] Check mobile usability
- [ ] Test all forms and functionality
- [ ] Monitor for 404 errors

---

## Additional Recommendations

### Future Enhancements

1. **Progressive Web App (PWA)**
   - Add service worker for offline functionality
   - Implement manifest.json for installability
   - Enable push notifications for updates

2. **Advanced Image Optimization**
   - Implement responsive images with srcset
   - Use next-gen formats (WebP, AVIF)
   - Consider image CDN (e.g., Cloudinary, Imgix)

3. **Content Delivery Network (CDN)**
   - Deploy static assets to CDN
   - Implement edge caching
   - Reduce latency for global visitors

4. **Security Headers**
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

5. **Analytics & Monitoring**
   - Google Analytics 4
   - Google Tag Manager
   - Real User Monitoring (RUM)
   - Error tracking (e.g., Sentry)

6. **Local SEO**
   - Google Business Profile optimization
   - Local directory listings
   - Customer reviews management
   - Local backlink building

---

## Resources

### SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com/)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Schema Markup Generator](https://technicalseo.com/tools/schema-markup-generator/)

### Performance Tools
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Image Optimization
- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)
- [ImageOptim](https://imageoptim.com/)

### Learning Resources
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Web.dev](https://web.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Schema.org](https://schema.org/)

---

## Support

For questions or issues related to SEO and performance optimizations, please consult:
1. This documentation
2. The project README.md
3. Official Vite documentation
4. Google Search Central documentation

Last Updated: January 2025
