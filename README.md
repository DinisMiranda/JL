# JL Law Firm Website

Modern, professional website for JL Law Firm, built with modern web technologies and best practices.

## Project Description

This is a static website for JL Law Firm that provides information about legal services, team members, and contact information. The website is built with vanilla JavaScript, Vite for bundling, and Tailwind CSS for styling.

### Features

- Modern, responsive design
- Fast loading times with Vite
- Optimized for SEO
- Contact form with email integration
- Professional presentation of legal services
- Team member profiles

## Tech Stack

- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **JavaScript**: ES6+ (Vanilla JS)
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd JL
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 2b. (Opcional) Site mais rápido

Para que as mudanças de página sejam mais rápidas (sem compilar Tailwind no browser em cada carregamento), gera o CSS pré-compilado uma vez:

```bash
npm run build:css
```

Isto cria `public/site.css`. O site usa este ficheiro quando existe; se não existir, carrega o Tailwind por CDN (funciona mas mais lento). Executa de novo `npm run build:css` sempre que alterares classes Tailwind no HTML.

### 3. Environment Setup (if needed)

Create a `.env` file in the root directory for any environment-specific variables:

```bash
# Example environment variables
VITE_API_URL=your_api_url_here
VITE_CONTACT_EMAIL=contact@jllawfirm.com
```

## Development Commands

### Start Development Server

Runs the app in development mode with hot module replacement (HMR):

```bash
npm run dev
```

The site will open automatically at [http://localhost:3000](http://localhost:3000)

### Build for Production

Creates an optimized production build in the `dist/` folder:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

The preview will be available at [http://localhost:4173](http://localhost:4173)

### Code Quality

#### Lint Code

Check and fix code quality issues:

```bash
npm run lint
```

#### Format Code

Format all files with Prettier:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

## Project Structure

```
JL/
├── src/                      # Source files
│   ├── assets/              # Static assets
│   │   └── images/          # Image files
│   ├── components/          # Reusable components
│   ├── styles/              # CSS/SCSS files
│   └── scripts/             # JavaScript modules
├── public/                  # Public static files (copied as-is)
│   ├── sitemap.xml          # SEO sitemap
│   └── robots.txt           # Crawler instructions
├── docs/                    # Documentation files
│   ├── SEO_PERFORMANCE_GUIDE.md      # Comprehensive SEO guide
│   └── SEO_QUICK_REFERENCE.md        # Quick reference for SEO tasks
├── dist/                    # Production build output (generated)
├── index.html               # Main HTML file
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies and scripts
└── README.md                # This file
```

## Mobile Optimization

This website is fully optimized for mobile devices with native-like interactions and performance:

### Mobile Features
- **Animated Navigation**: Smooth hamburger menu with staggered slide-in animations
- **Swipe Gestures**: Intuitive swipe right to open, swipe left to close menu
- **Touch Feedback**: Ripple effects on all interactive elements for visual feedback
- **Fluid Typography**: Responsive text scaling using CSS clamp() for perfect readability
- **Hardware Acceleration**: GPU-accelerated scrolling and animations for 60fps performance
- **Pull-to-Refresh**: Native-like pull-to-refresh functionality
- **iOS/Android Integration**: Safe area support, theme colors, and standalone mode
- **PWA Capable**: Installable as a Progressive Web App with offline support

### Mobile Documentation
For complete details, see:
- `docs/MOBILE_OPTIMIZATION_GUIDE.md` - Comprehensive mobile optimization guide
- `docs/MOBILE_QUICK_REFERENCE.md` - Quick reference for mobile tasks
- `src/styles/mobile.css` - All mobile-specific styles

### Testing Your Mobile Experience
Test on real devices or use DevTools:
- Chrome DevTools: F12 → Device Mode
- Test devices: iPhone, iPad, Samsung Galaxy, etc.
- Run Lighthouse mobile audit

## Accessibility

This website is fully **WCAG 2.1 Level AA compliant**, ensuring that all users can access and navigate the site effectively:

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: ARIA labels, roles, and live regions for assistive technologies
- **Skip-to-Content**: Quick navigation link for keyboard users
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Form Accessibility**: Clear labels, validation, and error messages
- **Modal Dialogs**: Focus management and keyboard trapping
- **Touch Targets**: Minimum 44px touch targets for mobile users
- **Color Contrast**: WCAG AA compliant contrast ratios (4.5:1 for text)
- **Reduced Motion**: Support for users who prefer reduced motion
- **Alt Text**: Descriptive alternative text for all meaningful images

### Accessibility Documentation
For complete details, see:
- `docs/ACCESSIBILITY_GUIDE.md` - Comprehensive accessibility guide
- `src/styles/accessibility.css` - Accessibility CSS styles

### Testing Your Accessibility
Use these tools to verify accessibility:
- [WAVE Web Accessibility Tool](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

## SEO and Performance

This website is optimized for search engines and performance with:

### SEO Features
- **Comprehensive Meta Tags**: Title, description, keywords, Open Graph, Twitter Cards
- **Structured Data (JSON-LD)**: LegalService, Person, WebSite, and BreadcrumbList schemas
- **Sitemap.xml**: Complete sitemap with image indexing
- **Robots.txt**: Search engine crawler configuration
- **Geo-targeting**: Location tags for Braga, Portugal
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

### Performance Optimizations
- **Image Optimization**: Lazy loading, proper dimensions, optimized alt text
- **Resource Loading**: Preconnect and DNS prefetch for CDNs
- **Code Splitting**: Vendor bundles and optimized chunks
- **Minification**: Terser for JS, cssnano for CSS
- **Compression**: Gzip and Brotli compression (files > 10kb)
- **Caching**: Content-hash based file naming for optimal caching

### Documentation
For detailed information, see:
- `docs/SEO_PERFORMANCE_GUIDE.md` - Complete SEO and performance guide
- `docs/SEO_QUICK_REFERENCE.md` - Quick reference for common tasks

### Testing Your SEO
After deployment, use these tools:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

## Deployment Guide

### Deploying to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Install Netlify CLI (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

Or connect your GitHub repository to Netlify for automatic deployments:
- Build command: `npm run build`
- Publish directory: `dist`

### Deploying to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

Or connect your GitHub repository to Vercel for automatic deployments.

### Deploying to GitHub Pages

1. Install the `gh-pages` package:
   ```bash
   npm install -D gh-pages
   ```

2. Add deployment script to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.js` with the base path:
   ```javascript
   export default defineConfig({
     base: '/JL/',  // Replace with your repo name
     // ... other config
   });
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Traditional Web Hosting

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist/` folder to your web hosting service via FTP/SFTP or hosting control panel.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test your changes with `npm run dev`
5. Build and verify with `npm run build && npm run preview`
6. Commit your changes with clear commit messages
7. Push to your branch and create a pull request

## License

ISC License - See LICENSE file for details

## Contact

For questions or support, please contact:
- Website: [JL Law Firm Website]
- Email: contact@jllawfirm.com

---

Built with modern web technologies for optimal performance and user experience.
