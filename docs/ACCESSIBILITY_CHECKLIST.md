# Accessibility Checklist for Developers

Quick reference checklist for maintaining WCAG 2.1 AA compliance when making changes to the website.

## Before Committing Code

### General
- [ ] All new interactive elements are keyboard accessible
- [ ] Focus indicators are visible on all focusable elements
- [ ] Tab order is logical and intuitive
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast (4.5:1 for normal, 3:1 for large)

### HTML Structure
- [ ] Semantic HTML elements used correctly
- [ ] Heading hierarchy is maintained (no skipped levels)
- [ ] Page has single H1 element
- [ ] Landmark roles properly implemented

### Images
- [ ] All images have appropriate alt text
- [ ] Decorative images have `alt=""` or `role="presentation"`
- [ ] Complex images have detailed descriptions
- [ ] Images have `width` and `height` attributes
- [ ] Below-fold images use `loading="lazy"`

### Links and Buttons
- [ ] Links have descriptive text (not "click here")
- [ ] Buttons have clear purpose
- [ ] All interactive elements have minimum 44px touch target
- [ ] aria-label added when visual text isn't descriptive enough
- [ ] Button `type` attribute specified

### Forms
- [ ] All inputs have associated labels (`for` and `id` match)
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages associated via `aria-describedby`
- [ ] Validation errors announced to screen readers
- [ ] Error messages visible and clear
- [ ] Autocomplete attributes added where appropriate
- [ ] Field grouping uses `<fieldset>` and `<legend>`

### ARIA
- [ ] ARIA labels are descriptive and concise
- [ ] `aria-hidden` used appropriately
- [ ] Live regions configured correctly (`aria-live`, `role="alert"`)
- [ ] ARIA states updated when UI changes (`aria-expanded`, `aria-invalid`)
- [ ] Complex widgets follow WAI-ARIA patterns

### Keyboard Navigation
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Skip-to-content link works
- [ ] Modal/dialog focus management works correctly
- [ ] Escape key closes modals/menus
- [ ] Focus returns to trigger element after modal closes

### Testing Performed
- [ ] Tested with keyboard only (Tab, Shift+Tab, Enter, Space, Escape)
- [ ] Tested with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Ran automated accessibility audit (WAVE, axe, or Lighthouse)
- [ ] Tested at 200% zoom
- [ ] Tested on mobile device
- [ ] Verified color contrast ratios
- [ ] Checked with `prefers-reduced-motion` enabled

---

## Component-Specific Checklists

### Adding a New Button

```html
<!-- Template -->
<button
  type="button"
  class="... min-h-[44px]"
  aria-label="Descriptive action"
>
  Button Text
</button>
```

**Checklist:**
- [ ] `type` attribute specified
- [ ] Minimum height 44px
- [ ] `aria-label` if text isn't descriptive enough
- [ ] Focus styles applied
- [ ] Keyboard accessible (Enter/Space)
- [ ] Screen reader announces button correctly

### Adding a New Form Field

```html
<!-- Template -->
<div>
  <label for="field-id">
    Field Label <span aria-label="required">*</span>
  </label>
  <input
    type="text"
    id="field-id"
    name="field-name"
    required
    aria-required="true"
    aria-describedby="field-error field-hint"
    aria-invalid="false"
    class="... min-h-[44px]"
  />
  <span id="field-hint" class="text-sm text-gray-600">
    Helpful hint text
  </span>
  <span id="field-error" class="hidden text-red-600" role="alert">
    Error message
  </span>
</div>
```

**Checklist:**
- [ ] Label explicitly associated with input
- [ ] Required attribute and aria-required
- [ ] Error span with `role="alert"`
- [ ] aria-describedby includes error and hint IDs
- [ ] Minimum height 44px
- [ ] Input type appropriate
- [ ] Autocomplete attribute if applicable
- [ ] Validation JavaScript updates `aria-invalid`

### Adding a New Modal/Dialog

```html
<!-- Template -->
<div
  id="modal-id"
  class="hidden ..."
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-hidden="true"
>
  <div role="document">
    <h2 id="modal-title">Modal Title</h2>
    <button
      aria-label="Close modal"
      onclick="closeModal()"
    >
      &times;
    </button>
    <!-- Modal content -->
  </div>
</div>
```

**JavaScript Requirements:**
```javascript
function openModal() {
  // Save last focused element
  lastFocusedElement = document.activeElement;

  // Show modal
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  // Focus first element
  firstFocusableElement.focus();

  // Trap focus
  setupFocusTrap();
}

function closeModal() {
  // Hide modal
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');

  // Return focus
  lastFocusedElement.focus();
}
```

**Checklist:**
- [ ] role="dialog" and aria-modal="true"
- [ ] aria-labelledby points to title
- [ ] aria-hidden toggles correctly
- [ ] Focus moves to modal when opened
- [ ] Focus trapped within modal (Tab cycles)
- [ ] Focus returns to trigger when closed
- [ ] Escape key closes modal
- [ ] Close button has aria-label
- [ ] Background scroll disabled when open
- [ ] Announced to screen readers

### Adding a New Link

```html
<!-- Template -->
<a
  href="/page"
  class="... min-h-[44px]"
  aria-label="Descriptive purpose (if needed)"
>
  Link Text
</a>
```

**Checklist:**
- [ ] Href attribute present (not `#` or `javascript:`)
- [ ] Link text is descriptive (not "click here")
- [ ] Minimum touch target 44px
- [ ] Opens in new tab only if necessary
- [ ] If new tab, includes `target="_blank" rel="noopener noreferrer"`
- [ ] If new tab, aria-label mentions it
- [ ] Focus styles applied

### Adding an Image

```html
<!-- Informative Image -->
<img
  src="image.jpg"
  alt="Descriptive alternative text"
  width="800"
  height="600"
  loading="lazy"
/>

<!-- Decorative Image -->
<img
  src="decoration.jpg"
  alt=""
  role="presentation"
  loading="lazy"
/>
```

**Checklist:**
- [ ] Alt text provided (or empty if decorative)
- [ ] Alt text is descriptive and meaningful
- [ ] Width and height attributes specified
- [ ] Loading attribute set (lazy for below-fold)
- [ ] Image compressed and optimized
- [ ] Context provided for complex images

---

## Quick Reference

### Minimum Touch Targets
- **Buttons**: 44px × 44px
- **Links**: 44px × 44px (with padding)
- **Form inputs**: 44px height
- **Checkbox/Radio**: 44px × 44px (clickable area)

### Color Contrast Ratios (WCAG AA)
- **Normal text** (< 18pt): 4.5:1
- **Large text** (≥ 18pt): 3:1
- **UI components**: 3:1

### ARIA States
- `aria-expanded`: true/false (for menus, accordions)
- `aria-invalid`: true/false (for form validation)
- `aria-hidden`: true/false (for visibility)
- `aria-live`: off/polite/assertive (for announcements)
- `aria-busy`: true/false (for loading states)

### Common Roles
- `role="banner"`: Site header
- `role="navigation"`: Navigation section
- `role="main"`: Main content
- `role="contentinfo"`: Footer
- `role="search"`: Search form
- `role="dialog"`: Modal dialog
- `role="alert"`: Important message

### Keyboard Shortcuts
- **Tab**: Move forward
- **Shift+Tab**: Move backward
- **Enter**: Activate button/link
- **Space**: Activate button, toggle checkbox
- **Escape**: Close modal/menu
- **Arrow keys**: Navigate within component

---

## Common Mistakes to Avoid

### ❌ Don't:
1. Use `<div>` or `<span>` as buttons (use `<button>`)
2. Skip heading levels (H2 → H4)
3. Use placeholder as label
4. Rely on color alone
5. Remove focus outlines
6. Create keyboard traps
7. Use non-descriptive link text
8. Forget to test with keyboard
9. Add ARIA when HTML semantics work
10. Use `tabindex` > 0

### ✅ Do:
1. Use semantic HTML first
2. Add ARIA only when needed
3. Test with keyboard and screen reader
4. Maintain heading hierarchy
5. Provide clear labels
6. Show visible focus indicators
7. Make all content keyboard accessible
8. Use descriptive link/button text
9. Ensure adequate color contrast
10. Test at different zoom levels

---

## Testing Commands

### Automated Testing
```bash
# Install Lighthouse
npm install -g lighthouse

# Run accessibility audit
lighthouse https://joaoloboadvogados.pt --only-categories=accessibility --view

# Or use npm script (if configured)
npm run test:a11y
```

### Browser Extensions
- **WAVE**: Install and click icon to scan page
- **axe DevTools**: Open DevTools > axe tab > Analyze
- **Lighthouse**: Open DevTools > Lighthouse tab > Accessibility

### Keyboard Testing Sequence
1. Tab from browser address bar
2. Verify skip-to-content link appears
3. Continue tabbing through all interactive elements
4. Verify focus indicators visible
5. Test Enter/Space on buttons
6. Test Escape on modals/menus
7. Verify no keyboard traps
8. Test Shift+Tab (backwards navigation)

---

## Resources

- **Full Guide**: See `docs/ACCESSIBILITY_GUIDE.md`
- **Styles**: See `src/styles/accessibility.css`
- **WCAG Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns**: https://www.w3.org/WAI/ARIA/apg/

---

**Last Updated**: January 2025

**Remember**: When in doubt, test with actual users and assistive technologies. Automated tools catch ~30-40% of accessibility issues – manual testing is essential.
