# Mobile Optimization Quick Reference

Quick reference guide for maintaining and enhancing mobile features on the João Lobo Advogados website.

---

## Quick Commands

### Test Mobile Locally
```bash
# Start dev server
npm run dev

# Open Chrome DevTools
Press F12 → Click device icon → Select device

# Test specific device
# iPhone SE, iPhone 12 Pro, Samsung Galaxy S20, iPad
```

### Run Mobile Performance Audit
```bash
# Using Lighthouse CLI
lighthouse https://joaoloboadvogados.pt --preset=perf --view

# Or use Chrome DevTools
F12 → Lighthouse → Mobile → Performance
```

---

## File Locations

| Feature | File | Lines |
|---------|------|-------|
| Mobile CSS | `src/styles/mobile.css` | All |
| Mobile JavaScript | `script.js` | 35-271 |
| iOS/Android Meta Tags | `index.html` | 4-25 |
| PWA Manifest | `public/manifest.json` | All |
| Hamburger Menu HTML | `index.html` | 288-301 |
| Mobile Nav HTML | `index.html` | 315-325 |

---

## Common Tasks

### 1. Adjust Swipe Sensitivity

**File**: `script.js` (line 98)

```javascript
const minSwipeDistance = 50; // Change value (pixels)
```

**Values**:
- `30` - Very sensitive (may trigger accidentally)
- `50` - Default (recommended)
- `80` - Less sensitive (requires longer swipe)

### 2. Change Pull-to-Refresh Threshold

**File**: `script.js` (line 165)

```javascript
if (pullDistance > 80 && window.scrollY === 0) // Change 80
```

**Values**:
- `60` - Easier to trigger
- `80` - Default
- `100` - Harder to trigger

### 3. Modify Hamburger Animation Speed

**File**: `src/styles/mobile.css` (line 23)

```css
.hamburger-line {
  transition: all 0.3s cubic-bezier(...); /* Change 0.3s */
}
```

**Values**:
- `0.2s` - Faster
- `0.3s` - Default
- `0.4s` - Slower, more pronounced

### 4. Update Theme Color

**File**: `index.html` (line 17)

```html
<meta name="theme-color" content="#B91C1C" />
```

**File**: `public/manifest.json` (line 6)

```json
"theme_color": "#B91C1C"
```

### 5. Adjust Touch Target Sizes

**File**: `src/styles/mobile.css` (line 410)

```css
a, button, input {
  min-height: 44px; /* WCAG minimum, don't go below */
  min-width: 44px;
}
```

### 6. Change Mobile Menu Animation Delay

**File**: `src/styles/mobile.css` (lines 86-92)

```css
.mobile-nav:not(.hidden) a:nth-child(1) { transition-delay: 0.05s; }
.mobile-nav:not(.hidden) a:nth-child(2) { transition-delay: 0.1s; }
/* Adjust delays for each item */
```

---

## Testing Checklist

### Quick Mobile Test (5 minutes)

```bash
□ Open site on mobile device or DevTools device mode
□ Test hamburger menu open/close animation
□ Swipe right from left edge to open menu
□ Swipe left to close menu
□ Tap buttons - check for ripple effect
□ Check text readability at various zoom levels
□ Scroll page - verify smooth scrolling
□ Test form inputs - no zoom on iOS
□ Pull down at top of page - refresh indicator
```

### Browser Testing

```bash
□ Chrome (Android)
□ Safari (iOS)
□ Samsung Internet (Samsung devices)
□ Firefox Mobile
```

### Device Testing

```bash
□ iPhone SE (small screen)
□ iPhone 12/13/14 (standard)
□ iPhone 14 Pro Max (large)
□ Samsung Galaxy S20 (Android)
□ iPad (tablet)
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.8s | Check with Lighthouse |
| Largest Contentful Paint | < 2.5s | Check with Lighthouse |
| Time to Interactive | < 3.8s | Check with Lighthouse |
| Cumulative Layout Shift | < 0.1 | Check with Lighthouse |
| Mobile Lighthouse Score | > 90 | Check with Lighthouse |

### Check Current Scores

```bash
# Run Lighthouse
lighthouse https://joaoloboadvogados.pt --view

# Check specific metrics
lighthouse https://joaoloboadvogados.pt --only-categories=performance
```

---

## Common Issues & Quick Fixes

### Issue: Menu animation jerky

**Quick Fix**:
```css
/* Add to mobile.css */
.mobile-nav {
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Issue: iOS input zoom

**Quick Fix**:
```css
/* Ensure base font size is 16px */
input, textarea, select {
  font-size: 16px !important;
}
```

### Issue: Images shifting layout

**Quick Fix**:
```html
<!-- Always add width and height -->
<img src="image.jpg" width="800" height="600" alt="..." />
```

### Issue: Slow scroll performance

**Quick Fix**:
```css
/* Add to elements that animate */
.animating-element {
  will-change: transform;
  transform: translateZ(0);
}
```

### Issue: Pull-to-refresh not working

**Check**:
1. Are you at top of page? (`window.scrollY === 0`)
2. Is touch being detected? (Check console)
3. Does browser have native pull-to-refresh? (Disable in settings)

---

## Code Snippets

### Add Mobile-Only Content

```html
<!-- Show only on mobile -->
<div class="show-mobile">
  This appears only on mobile
</div>

<!-- Hide on mobile -->
<div class="hide-mobile">
  This is hidden on mobile
</div>
```

### Full Viewport Height (iOS-safe)

```css
.full-height {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100); /* iOS-safe */
}
```

### Touch-Friendly Button

```html
<button class="px-6 py-3 min-h-[44px] min-w-[44px]">
  Touch Me
</button>
```

### Responsive Image

```html
<img
  src="image.jpg"
  width="800"
  height="600"
  loading="lazy"
  alt="Descriptive text"
  class="w-full h-auto"
/>
```

### Prevent Text Selection on Buttons

```css
button, [role="button"] {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

---

## Useful DevTools Commands

### Check Touch Support

```javascript
console.log('Touch supported:', 'ontouchstart' in window);
```

### Check Viewport Size

```javascript
console.log('Width:', window.innerWidth);
console.log('Height:', window.innerHeight);
console.log('Device pixel ratio:', window.devicePixelRatio);
```

### Check Safe Area Insets (iOS)

```javascript
const safeAreaTop = getComputedStyle(document.documentElement)
  .getPropertyValue('env(safe-area-inset-top)');
console.log('Safe area top:', safeAreaTop);
```

### Force Viewport Height Recalculation

```javascript
window.dispatchEvent(new Event('resize'));
```

### Check Animation Performance

```javascript
// Open Chrome DevTools
// Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
// Type "Show Rendering"
// Enable "Paint flashing" and "Layout Shift Regions"
```

---

## Mobile Meta Tags

### Basic Template

```html
<!-- Basic -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- iOS -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="App Name" />

<!-- Android -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#B91C1C" />
```

---

## PWA Manifest Template

```json
{
  "name": "Full App Name",
  "short_name": "Short Name",
  "description": "App description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#B91C1C",
  "icons": [
    {
      "src": "/images/icon.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## Keyboard Shortcuts (DevTools)

| Action | Mac | Windows |
|--------|-----|---------|
| Open DevTools | `Cmd+Opt+I` | `F12` |
| Device Mode | `Cmd+Shift+M` | `Ctrl+Shift+M` |
| Lighthouse | `Cmd+Shift+P` → "Lighthouse" | `Ctrl+Shift+P` → "Lighthouse" |
| Reload | `Cmd+R` | `Ctrl+R` |
| Hard Reload | `Cmd+Shift+R` | `Ctrl+Shift+R` |
| Console | `Cmd+Opt+J` | `Ctrl+Shift+J` |

---

## Resources

### Testing
- [Chrome DevTools Device Mode](https://developer.chrome.com/docs/devtools/device-mode/)
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Responsive Design Checker](https://responsivedesignchecker.com/)

### Performance
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Documentation
- [MDN: Mobile Web](https://developer.mozilla.org/en-US/docs/Web/Guide/Mobile)
- [Apple: iOS Web Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design: Mobile](https://material.io/design/platform-guidance/android-mobile.html)

---

## Contact

For detailed information, see the full [Mobile Optimization Guide](./MOBILE_OPTIMIZATION_GUIDE.md).

For issues or questions:
- Check [Troubleshooting section](./MOBILE_OPTIMIZATION_GUIDE.md#troubleshooting) in full guide
- Review browser console for errors
- Test on real device if DevTools shows different behavior

---

**Last Updated**: January 2025
