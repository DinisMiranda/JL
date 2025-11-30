# SEO Quick Reference Guide

Quick reference for common SEO tasks and optimizations for the João Lobo Advogados website.

## Meta Tags Template

### Updating Page Title
```html
<title>Your Title Here | João Lobo Advogados</title>
```
**Best Practices:**
- Keep under 60 characters
- Include primary keyword
- Add location (Braga) if relevant
- Include brand name at the end

### Updating Meta Description
```html
<meta name="description" content="Your compelling description here (155-160 characters)" />
```
**Best Practices:**
- 155-160 characters optimal
- Include call-to-action
- Use active voice
- Include primary keyword naturally

## Image Optimization Checklist

### Adding New Images
```html
<img
  src="path/to/image.jpg"
  alt="Descriptive alt text with keywords"
  loading="lazy"
  width="800"
  height="600"
  class="your-classes-here"
/>
```

**Checklist:**
- [ ] Compress image before upload (TinyPNG, Squoosh)
- [ ] Use descriptive filename: `joao-lobo-escritorio.jpg`
- [ ] Add descriptive alt text (include keywords naturally)
- [ ] Specify width and height attributes
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Use `loading="eager"` only for LCP image (hero)
- [ ] Optimize for web (max 200KB for photos)

### Recommended Image Sizes
- Hero images: 1920x1080px
- Profile photos: 800x800px
- Thumbnails: 400x400px
- Open Graph images: 1200x630px

## Structured Data Updates

### When to Update JSON-LD

**Update when:**
- Adding new services
- Changing contact information
- Adding team members
- Modifying business hours
- Updating address

**Location in file:** `index.html` lines 72-248 (in `<head>`)

### Quick Service Addition
Add to `hasOfferCatalog.itemListElement`:
```json
{
  "@type": "Offer",
  "itemOffered": {
    "@type": "Service",
    "name": "Service Name",
    "description": "Service description"
  }
}
```

## Sitemap Updates

### File Location
`/public/sitemap.xml`

### Adding New Page
```xml
<url>
  <loc>https://joaoloboadvogados.pt/#new-section</loc>
  <lastmod>2025-01-17</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Change Frequency Guide
- `always` - Changes with every access
- `hourly` - Changes hourly
- `daily` - Changes daily
- `weekly` - Changes weekly
- `monthly` - Changes monthly (most common)
- `yearly` - Changes yearly
- `never` - Archived content

### Priority Guide
- `1.0` - Homepage
- `0.9` - Main sections (About, Services)
- `0.8` - Important subsections
- `0.7` - Regular content
- `0.5` - Less important content
- `0.3` - Archives

## Performance Quick Checks

### Build and Test
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Check bundle sizes
npm run build -- --mode production
```

### Lighthouse Audit
```bash
# Install globally (once)
npm install -g lighthouse

# Run audit
lighthouse https://joaoloboadvogados.pt --view

# Or use Chrome DevTools > Lighthouse tab
```

### Target Scores
- ✅ Performance: > 90
- ✅ Accessibility: > 95
- ✅ Best Practices: > 95
- ✅ SEO: > 95

## Common Issues & Solutions

### Issue: Low Performance Score

**Possible causes:**
- Large images not optimized
- Too many HTTP requests
- Render-blocking resources

**Solutions:**
1. Compress images
2. Enable lazy loading
3. Use preconnect for third-party resources
4. Minimize JavaScript

### Issue: Missing Structured Data

**Check:**
1. Validate at: https://validator.schema.org/
2. Test at: https://search.google.com/test/rich-results

**Fix:**
- Ensure JSON-LD is in `<head>`
- Check for syntax errors
- Verify all required fields

### Issue: Poor Mobile Usability

**Test:**
- Google Mobile-Friendly Test
- Chrome DevTools Device Mode
- Real device testing

**Common fixes:**
- Increase touch target sizes
- Fix horizontal scrolling
- Adjust font sizes
- Fix viewport configuration

## Keywords Strategy

### Primary Keywords
- advogado Braga
- escritório advocacia Braga
- João Lobo Advogados
- advogado Vila Verde
- serviços jurídicos Braga

### Secondary Keywords
- direito civil Braga
- direito comercial Braga
- direito penal Braga
- direito família Braga
- advogado internacional Braga
- direito imobiliário Braga

### Long-tail Keywords
- melhor escritório advocacia Braga
- advogado especialista direito civil Braga
- consultoria jurídica empresas Braga
- advogado herança partilha Braga

### Using Keywords

**Best Practices:**
- Use naturally in content
- Include in H1, H2 tags
- Add to meta description
- Use in image alt text
- Include in URL slugs
- Add to internal links

## Content Update Workflow

### 1. Before Publishing
- [ ] Keyword research
- [ ] Competitor analysis
- [ ] Content outline
- [ ] Target audience defined

### 2. Writing
- [ ] Include primary keyword in H1
- [ ] Use secondary keywords in H2/H3
- [ ] Write compelling meta description
- [ ] Add internal links
- [ ] Optimize images
- [ ] Use natural language

### 3. Technical SEO
- [ ] Update sitemap
- [ ] Add/update structured data
- [ ] Check heading hierarchy
- [ ] Validate HTML
- [ ] Test mobile responsiveness
- [ ] Check page speed

### 4. After Publishing
- [ ] Submit to Google Search Console
- [ ] Share on social media
- [ ] Monitor rankings
- [ ] Track traffic
- [ ] Update internal links from other pages

## Google Search Console Tasks

### Weekly
- Check for crawl errors
- Monitor Core Web Vitals
- Review search queries

### Monthly
- Analyze top pages
- Check mobile usability
- Review backlinks
- Update sitemap if needed

### Quarterly
- Performance trend analysis
- Keyword ranking review
- Competitor comparison
- Technical SEO audit

## Local SEO Checklist

### Google Business Profile
- [ ] Claim and verify listing
- [ ] Complete all information
- [ ] Add photos (minimum 10)
- [ ] Collect and respond to reviews
- [ ] Post updates regularly
- [ ] Add services offered
- [ ] Set business hours

### Local Citations
- [ ] Páginas Amarelas (Yellow Pages Portugal)
- [ ] SAPO Páginas Amarelas
- [ ] Yelp Portugal
- [ ] Facebook Business Page
- [ ] LinkedIn Company Page

### NAP Consistency
Ensure consistent Name, Address, Phone across:
- Website
- Google Business Profile
- Social media profiles
- Online directories
- Citations

## Browser Caching

### Recommended Cache Headers
```
# Static assets
Cache-Control: public, max-age=31536000, immutable

# HTML
Cache-Control: no-cache, must-revalidate

# API responses
Cache-Control: no-store
```

**Note:** Vite handles this automatically with content hashes.

## Monitoring & Analytics

### Essential Metrics to Track

**SEO Metrics:**
- Organic traffic
- Keyword rankings
- Backlinks
- Domain authority
- Click-through rate (CTR)

**Performance Metrics:**
- Page load time
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

**User Metrics:**
- Bounce rate
- Session duration
- Pages per session
- Conversion rate

### Tools Setup

1. **Google Analytics 4**
   - Track visitor behavior
   - Monitor conversions
   - Analyze traffic sources

2. **Google Search Console**
   - Monitor search performance
   - Submit sitemap
   - Check indexing status
   - Fix crawl errors

3. **Google Tag Manager** (Optional)
   - Manage tracking codes
   - Event tracking
   - Enhanced e-commerce

## Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Production Build
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Lint JavaScript
npm run format          # Format code
npm run format:check    # Check formatting

# Testing
npm run build -- --mode production  # Production build with stats
```

## Emergency Checklist

If website is down or performing poorly:

1. **Check Build**
   ```bash
   npm run build
   ```
   - Look for errors
   - Check bundle sizes

2. **Verify Deployment**
   - Confirm files uploaded
   - Check .htaccess or server config
   - Verify DNS settings

3. **Test Performance**
   - Run PageSpeed Insights
   - Check GTmetrix
   - Monitor Core Web Vitals

4. **Check Search Console**
   - Coverage issues
   - Mobile usability
   - Security issues
   - Manual actions

5. **Review Recent Changes**
   - Git history
   - Recent deployments
   - Configuration changes

## Contact for SEO Support

**Internal Resources:**
- `docs/SEO_PERFORMANCE_GUIDE.md` - Full documentation
- `README.md` - Project setup and basics

**External Resources:**
- Google Search Central: https://developers.google.com/search
- Schema.org: https://schema.org/
- Web.dev: https://web.dev/

---

**Last Updated:** January 2025
**Version:** 1.0.0
