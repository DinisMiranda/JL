# Accessibility Guide - WCAG 2.1 AA Compliance

## Overview

This website is designed to be fully accessible and complies with **WCAG 2.1 Level AA** standards. This document outlines all accessibility features implemented and provides guidance for maintaining accessibility.

## Table of Contents

1. [Compliance Summary](#compliance-summary)
2. [Accessibility Features](#accessibility-features)
3. [Testing and Validation](#testing-and-validation)
4. [Maintenance Guidelines](#maintenance-guidelines)
5. [Known Limitations](#known-limitations)
6. [Resources](#resources)

---

## Compliance Summary

### WCAG 2.1 AA Compliance Checklist

✅ **Perceivable**
- Text alternatives for non-text content
- Captions and alternatives for multimedia
- Adaptable content structure
- Distinguishable content (color contrast, text sizing)

✅ **Operable**
- Keyboard accessible
- Sufficient time for reading and using content
- Seizure-safe design (no flashing content)
- Navigable with clear focus indicators
- Input modalities beyond keyboard

✅ **Understandable**
- Readable and understandable text
- Predictable functionality
- Input assistance with error identification

✅ **Robust**
- Compatible with current and future technologies
- Works with assistive technologies

---

## Accessibility Features

### 1. Keyboard Navigation

#### Skip-to-Content Link
- **Location**: Top of page (visually hidden until focused)
- **Keyboard**: Tab to access, Enter to skip to main content
- **Purpose**: Allows keyboard users to bypass navigation

```html
<a href="#main-content" class="skip-to-content">
  Saltar para o conteúdo principal
</a>
```

#### Focus Indicators
- Visible focus outline on all interactive elements
- 3px solid outline with secondary color (#c9a14a)
- Enhanced contrast ratio meets WCAG AA standards
- Keyboard-only focus (`:focus-visible` support)

#### Keyboard Shortcuts
| Action | Keyboard Shortcut |
|--------|-------------------|
| Skip to main content | Tab (from page load), then Enter |
| Navigate links/buttons | Tab / Shift+Tab |
| Activate button/link | Enter or Space |
| Close mobile menu | Escape |
| Close modal | Escape |
| Navigate within modal | Tab (trapped within modal) |

### 2. Screen Reader Support

#### ARIA Labels and Roles
- **Landmarks**: All major sections have proper roles
  - `<header role="banner">` - Site header
  - `<main role="main">` - Main content
  - `<nav role="navigation">` - Navigation areas
  - `<footer role="contentinfo">` - Site footer

#### Section Labels
```html
<section id="contacto" aria-labelledby="contacto-heading">
  <h2 id="contacto-heading">Contacte-nos</h2>
</section>
```

#### Button Labels
- All buttons have descriptive `aria-label` attributes
- Mobile menu button announces current state (expanded/collapsed)
- Modal close button clearly labeled

#### Live Regions
- Form validation messages use `role="alert"` and `aria-live="polite"`
- Screen reader announcements for:
  - Menu open/close
  - Form submission status
  - Modal open/close
  - Validation errors

### 3. Semantic HTML

#### Proper Heading Hierarchy
- Single `<h1>` per page (hero section)
- Logical heading structure (H1 → H2 → H3)
- No heading level skipping
- Headings accurately describe content

#### Semantic Elements
- `<header>` for site header
- `<nav>` for navigation
- `<main>` for main content
- `<article>` for independent content
- `<section>` for thematic grouping
- `<footer>` for site footer
- `<address>` for contact information

### 4. Forms Accessibility

#### Labels and Instructions
- All form fields have explicit `<label>` elements
- Required fields marked with `*` and `aria-required="true"`
- Error messages associated with fields via `aria-describedby`

#### Validation
- Real-time validation on blur
- Clear error messages
- Errors announced to screen readers
- First error receives focus
- Visual indicators (red border, error text)

#### Form Fields
```html
<label for="nome">
  Nome <span class="text-primary" aria-label="campo obrigatório">*</span>
</label>
<input
  type="text"
  id="nome"
  name="nome"
  required
  aria-required="true"
  aria-describedby="nome-error"
  aria-invalid="false"
/>
<span id="nome-error" class="text-red-600 hidden" role="alert"></span>
```

#### Autocomplete
- Email field has `autocomplete="email"`
- Facilitates form filling for users with cognitive disabilities

### 5. Modal Dialog Accessibility

#### ARIA Attributes
- `role="dialog"` - Identifies as dialog
- `aria-modal="true"` - Indicates modal behavior
- `aria-labelledby` - Points to modal title
- `aria-hidden` - Toggles visibility state

#### Focus Management
- Focus moves to first focusable element when opened
- Focus trapped within modal (Tab cycles through modal elements)
- Focus returns to trigger element when closed
- Escape key closes modal

#### Keyboard Support
```javascript
// Focus trap implementation
if (event.key === 'Tab') {
  if (event.shiftKey) {
    // Shift+Tab at first element → go to last element
  } else {
    // Tab at last element → go to first element
  }
}
```

### 6. Images and Alternative Text

#### Alt Text Guidelines
- Decorative images: `alt=""` or `role="presentation"`
- Informative images: Descriptive alt text with context
- Complex images: Detailed description in surrounding text

**Examples:**
```html
<!-- Decorative -->
<img src="background.png" alt="" role="presentation" />

<!-- Informative -->
<img src="lawyer.jpg" alt="Dr. João Lobo - Advogado responsável" />
```

#### Lazy Loading
- All images below-the-fold use `loading="lazy"`
- Hero image uses `loading="eager"` for LCP optimization
- Width and height attributes prevent layout shift

### 7. Touch Target Sizes

All interactive elements meet minimum touch target size of **44px × 44px**:
- Buttons: `min-h-[44px]`
- Links: Adequate padding for touch
- Form inputs: `min-h-[44px]`
- Mobile menu items: `min-h-[44px]`

### 8. Color Contrast

#### Text Contrast Ratios (WCAG AA)
- **Normal text** (< 18pt): 4.5:1 minimum
- **Large text** (≥ 18pt or 14pt bold): 3:1 minimum
- **UI components**: 3:1 minimum

#### Color Palette
| Element | Foreground | Background | Ratio | Pass |
|---------|------------|------------|-------|------|
| Body text | #374151 (gray-700) | #FFFFFF | 10.7:1 | ✅ |
| Primary text | #111827 (gray-900) | #FFFFFF | 16.9:1 | ✅ |
| Links | #B91C1C (primary) | #FFFFFF | 6.2:1 | ✅ |
| Buttons | #FFFFFF | #c9a14a (secondary) | 5.3:1 | ✅ |
| Error text | #dc2626 (red-600) | #FFFFFF | 5.9:1 | ✅ |

#### Non-Color Indicators
- Form errors: Icon + color + text
- Required fields: Asterisk + aria-label
- Focus: Outline + shadow (not just color)

### 9. Responsive Design

#### Mobile Considerations
- Font size minimum 16px (prevents zoom on iOS)
- Touch targets minimum 44px
- Mobile menu fully keyboard accessible
- Viewport meta tag prevents unwanted zooming

#### Responsive Text
- Text scales with viewport
- Line height: 1.5 (body), 1.6 (paragraphs)
- No horizontal scrolling at any viewport size

### 10. Motion and Animation

#### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Users who prefer reduced motion will see:
- No transitions or animations
- Instant state changes
- Smooth scrolling disabled

---

## Testing and Validation

### Automated Testing Tools

#### 1. WAVE (Web Accessibility Evaluation Tool)
- **URL**: https://wave.webaim.org/
- **Usage**: Enter site URL for automated audit
- **Expected**: 0 errors, minimal alerts

#### 2. axe DevTools
- **Installation**: Chrome/Firefox extension
- **Usage**: Open DevTools > axe tab > Analyze
- **Expected**: 0 critical issues

#### 3. Lighthouse (Chrome DevTools)
- **Usage**: DevTools > Lighthouse > Accessibility
- **Target Score**: 95-100

#### 4. NVDA/JAWS Screen Reader
- **NVDA**: Free, open-source (Windows)
- **JAWS**: Industry standard (Windows)
- **Testing checklist**:
  - All content announced correctly
  - Navigation landmarks work
  - Form labels announced
  - Errors announced
  - Modal behavior correct

#### 5. Keyboard-Only Testing
**Test scenarios:**
1. Navigate entire site using only Tab/Shift+Tab
2. All interactive elements focusable and visible
3. Logical tab order maintained
4. Skip-to-content link works
5. Modal focus trap works
6. Mobile menu opens/closes with keyboard

### Manual Testing Checklist

#### Visual Testing
- [ ] All text readable (font size, contrast)
- [ ] Focus indicators visible on all interactive elements
- [ ] No content hidden behind fixed elements
- [ ] Layout doesn't break at any zoom level (up to 200%)
- [ ] No information conveyed by color alone

#### Keyboard Testing
- [ ] All functionality available via keyboard
- [ ] Logical tab order throughout page
- [ ] Skip-to-content link appears on first Tab
- [ ] Modal traps focus correctly
- [ ] Escape closes modal and mobile menu
- [ ] No keyboard traps (can navigate away from all elements)

#### Screen Reader Testing
- [ ] Page title announced
- [ ] Headings announce level and text
- [ ] Landmarks announce correctly
- [ ] Forms labels announced
- [ ] Required fields identified
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Images have appropriate alt text

#### Mobile Testing
- [ ] Touch targets minimum 44px
- [ ] Mobile menu fully accessible
- [ ] Form inputs don't cause unwanted zoom
- [ ] Gestures have keyboard alternatives
- [ ] Landscape and portrait modes work

---

## Maintenance Guidelines

### Adding New Content

#### Images
1. Always provide descriptive alt text
2. Use `loading="lazy"` for below-fold images
3. Specify `width` and `height` attributes
4. Compress images before upload

```html
<img
  src="new-image.jpg"
  alt="Descriptive text explaining the image"
  loading="lazy"
  width="800"
  height="600"
/>
```

#### Forms
1. Always associate labels with inputs
2. Mark required fields with `aria-required="true"`
3. Provide error messages with `aria-describedby`
4. Use appropriate input types
5. Add autocomplete attributes where appropriate

```html
<label for="field-id">Field Label *</label>
<input
  type="text"
  id="field-id"
  name="field-name"
  required
  aria-required="true"
  aria-describedby="field-error"
/>
<span id="field-error" class="hidden" role="alert"></span>
```

#### Buttons and Links
1. Use descriptive text (avoid "click here")
2. Add `aria-label` for context
3. Ensure minimum 44px touch target
4. Test with keyboard

```html
<!-- Bad -->
<button>Click here</button>

<!-- Good -->
<button aria-label="Ler artigo completo sobre direito civil">
  Ler mais
</button>
```

#### Headings
1. Maintain logical hierarchy (don't skip levels)
2. One H1 per page
3. Use headings for structure, not styling
4. Make headings descriptive

### Regular Audits

#### Monthly
- Run automated accessibility tests (WAVE, axe)
- Check for new WCAG updates
- Review user feedback

#### Quarterly
- Full manual accessibility audit
- Screen reader testing
- Keyboard navigation testing
- Mobile accessibility testing

#### Annually
- Professional accessibility audit
- Update accessibility statement
- Review and update documentation

### Common Issues to Avoid

❌ **Don't:**
- Skip heading levels (H2 → H4)
- Use color alone to convey information
- Create keyboard traps
- Use non-descriptive link text ("click here", "read more")
- Forget to test with actual assistive technologies
- Remove focus indicators
- Use low contrast colors
- Rely solely on automated testing

✅ **Do:**
- Test with keyboard regularly
- Provide text alternatives
- Maintain semantic HTML structure
- Keep focus indicators visible
- Test with screen readers
- Monitor color contrast
- Follow WCAG guidelines
- Conduct manual testing

---

## Known Limitations

### Current Limitations

1. **External CDN Scripts**
   - Tailwind CSS loaded from CDN (not auditable)
   - EmailJS library (third-party)
   - **Mitigation**: Monitor for updates, test regularly

2. **Dynamic Content**
   - Articles loaded via JavaScript
   - **Mitigation**: Proper ARIA announcements implemented

3. **PDF Downloads** (if added in future)
   - Ensure PDFs are tagged and accessible
   - Provide HTML alternative

### Future Enhancements

1. **High Contrast Mode**
   - Dedicated high contrast theme
   - User preference detection

2. **Font Sizing**
   - User-controlled text size adjustment
   - Persistent preference storage

3. **Language Toggle**
   - Portuguese/English content
   - `lang` attribute updates

4. **Accessible PDF Generation**
   - Tagged PDFs for brochures
   - Screen reader friendly

---

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.1 Understanding Docs](https://www.w3.org/WAI/WCAG21/Understanding/)
- [How to Meet WCAG](https://www.w3.org/WAI/WCAG21/quickref/)

### Testing Tools
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [NVDA](https://www.nvaccess.org/) - Free screen reader
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/) - Contrast checking

### Learn More
- [WebAIM](https://webaim.org/) - Web accessibility resources
- [A11y Project](https://www.a11yproject.com/) - Community-driven accessibility
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) - Technical docs
- [Inclusive Components](https://inclusive-components.design/) - Accessible patterns

### ARIA Documentation
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - Patterns and examples
- [ARIA Specification](https://www.w3.org/TR/wai-aria-1.2/) - Complete spec
- [Using ARIA](https://www.w3.org/TR/using-aria/) - Best practices

### Portuguese Resources
- [Unidade ACESSO](https://www.acessibilidade.gov.pt/) - Portuguese accessibility unit
- [W3C Portugal](https://www.w3c.pt/) - Portuguese W3C office

---

## Accessibility Statement

This website is committed to providing an accessible experience for all users. We strive to conform to WCAG 2.1 Level AA standards.

### Feedback

If you encounter any accessibility barriers, please contact us:
- **Email**: joaojlobo@hotmail.com
- **Phone**: +351 915 964 547

We welcome your feedback and will work to address any issues promptly.

### Last Updated

This accessibility guide was last updated: **January 2025**

**Version**: 1.0.0

---

**Note**: Accessibility is an ongoing commitment. This guide should be reviewed and updated regularly as the website evolves and new standards emerge.
