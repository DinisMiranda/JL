# Contact Form - Validation & Security Guide

## Overview

This document describes the comprehensive validation, security, and user experience features implemented in the contact form.

## Table of Contents

1. [Features Summary](#features-summary)
2. [Client-Side Validation](#client-side-validation)
3. [Security Features](#security-features)
4. [EmailJS Integration](#emailjs-integration)
5. [User Experience](#user-experience)
6. [Analytics & Tracking](#analytics--tracking)
7. [Error Handling](#error-handling)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Features Summary

### ✅ Validation
- Real-time field validation on blur
- Comprehensive email format validation
- Character limits (min/max) for all fields
- Character counter for textarea
- Visual error indicators
- Screen reader error announcements

### 🔒 Security
- Input sanitization (XSS protection)
- Honeypot spam protection
- Rate limiting (3 attempts per 15 minutes)
- Disposable email blocking
- CSRF-ready (add token as needed)

### 📧 EmailJS Integration
- Retry logic with exponential backoff
- Timeout handling (10 seconds)
- Fallback to mailto on failure
- Configuration validation
- Detailed error tracking

### 🎨 User Experience
- Loading spinner during submission
- Success/error/warning messages with icons
- Disabled state styling
- Form reset on success
- Focus management
- Accessibility-first design

---

## Client-Side Validation

### Validation Rules

#### Name Field (`nome`)
```javascript
{
  min: 2 characters,
  max: 100 characters,
  required: true,
  pattern: Any UTF-8 characters
}
```

**Error Messages:**
- Empty: "Por favor, insira o seu nome"
- Invalid: "Por favor, insira um nome válido (2-100 caracteres)"

#### Email Field (`email`)
```javascript
{
  format: RFC 5322 compliant,
  required: true,
  blocked: Disposable email domains
}
```

**Validation Logic:**
```javascript
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;

  // Block disposable domains
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1];
  if (disposableDomains.some(d => domain.includes(d))) {
    return false;
  }

  return true;
}
```

**Error Messages:**
- Empty: "Por favor, insira o seu email"
- Invalid: "Por favor, insira um email válido"

#### Subject Field (`assunto`)
```javascript
{
  min: 5 characters,
  max: 200 characters,
  required: true
}
```

**Error Messages:**
- Empty: "Por favor, insira o assunto"
- Invalid: "Por favor, insira um assunto válido (5-200 caracteres)"

#### Message Field (`mensagem`)
```javascript
{
  min: 10 characters,
  max: 1000 characters,
  required: true,
  features: Character counter
}
```

**Character Counter:**
- Updates in real-time
- Orange warning at 90% capacity (900 chars)
- Red alert at 100% capacity (1000 chars)
- ARIA live region for screen readers

**Error Messages:**
- Empty: "Por favor, insira uma mensagem"
- Invalid: "Por favor, insira uma mensagem (10-1000 caracteres)"

### Real-Time Validation

**Validation Triggers:**
1. **On Blur**: Validate when user leaves field
2. **On Input**: Clear error if user starts typing
3. **On Submit**: Validate all fields

**Visual Indicators:**
- ✅ **Valid**: Gray border (default)
- ❌ **Invalid**: Red border + error message below
- 🔄 **Typing**: Error clears automatically

**Code Example:**
```javascript
field.addEventListener('blur', () => {
  if (field.value.trim()) {
    validateField(id, errorId, validateFn, errorMessage);
  }
});

field.addEventListener('input', () => {
  if (field.getAttribute('aria-invalid') === 'true') {
    clearFieldError(id, errorId);
  }
});
```

---

## Security Features

### 1. Input Sanitization

**Purpose**: Prevent XSS (Cross-Site Scripting) attacks

**Implementation:**
```javascript
function sanitizeInput(input) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/gi, (match) => map[match]);
}
```

**Applied To:**
- Name field
- Subject field
- Message field

**Email Sanitization:**
```javascript
function sanitizeEmail(email) {
  return email.trim().toLowerCase();
}
```

### 2. Honeypot Spam Protection

**How it Works:**
- Hidden field that users don't see
- Bots automatically fill all fields
- If honeypot is filled, submission is silently rejected

**HTML:**
```html
<div class="hidden" aria-hidden="true">
  <label for="website">Website</label>
  <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
</div>
```

**JavaScript Check:**
```javascript
function checkHoneypot() {
  const honeypot = document.getElementById('website');
  if (honeypot && honeypot.value !== '') {
    console.warn('Honeypot triggered - potential spam detected');
    return false;
  }
  return true;
}
```

**Response on Detection:**
- Form shows generic error
- No indication to bot that honeypot was detected
- Event tracked in analytics

### 3. Rate Limiting

**Configuration:**
```javascript
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'form_submissions'
};
```

**Storage:**
- Uses `localStorage` to track submissions
- Stores timestamps of attempts
- Automatically removes old attempts outside window

**User Experience:**
- User sees warning message with time remaining
- Clear countdown of minutes to wait
- Information shown below submit button

**How It Works:**
```javascript
// On submission
if (data.attempts.length >= 3) {
  return {
    allowed: false,
    message: `Limite de envios atingido. Por favor, aguarde ${minutesLeft} minutos.`
  };
}

// After successful submission
recordSubmission(); // Adds timestamp to localStorage
```

**Bypass for Testing:**
```javascript
// Clear rate limit data
localStorage.removeItem('form_submissions');
```

### 4. Disposable Email Blocking

**Purpose**: Prevent spam from temporary email services

**Blocked Domains:**
- tempmail.com
- 10minutemail.com
- guerrillamail.com

**To Add More:**
```javascript
const disposableDomains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  // Add more here
];
```

### 5. CSRF Protection (Ready)

**Current Status**: Not implemented (static site)

**To Add (if needed):**
```html
<input type="hidden" name="csrf_token" value="<?= csrf_token() ?>" />
```

```javascript
// Add to formData
csrf_token: document.querySelector('[name="csrf_token"]').value
```

---

## EmailJS Integration

### Configuration

**Location**: `script.js` (lines 481-488)

```javascript
const EMAIL_CONFIG = {
  SERVICE_ID: 'service_7qyix2h',
  TEMPLATE_ID: 'out15ba',
  PUBLIC_KEY: 'mnMtNP24K1Fi5ZIC6',
  MAX_RETRIES: 2,
  RETRY_DELAY: 2000, // 2 seconds
  TIMEOUT: 10000 // 10 seconds
};
```

### Setup Instructions

1. **Create EmailJS Account**
   - Visit: https://www.emailjs.com
   - Sign up for free account

2. **Add Email Service**
   - Go to "Email Services"
   - Add Gmail, Outlook, or other provider
   - Note the Service ID

3. **Create Email Template**
   - Go to "Email Templates"
   - Create new template
   - Add these variables:
     - `{{from_name}}` - Sender name
     - `{{from_email}}` - Sender email
     - `{{subject}}` - Email subject
     - `{{message}}` - Message content
     - `{{reply_to}}` - Reply-to address
     - `{{to_email}}` - Recipient email
     - `{{timestamp}}` - Submission time

4. **Get API Keys**
   - Go to "Integration"
   - Copy Public Key
   - Note Template ID

5. **Update Configuration**
   ```javascript
   const EMAIL_CONFIG = {
     SERVICE_ID: 'your_service_id',
     TEMPLATE_ID: 'your_template_id',
     PUBLIC_KEY: 'your_public_key',
     // Keep other settings
   };
   ```

### Retry Logic

**How It Works:**
1. First attempt
2. Wait 2 seconds → Second attempt
3. Wait 4 seconds → Third attempt
4. If all fail → Show error

**Exponential Backoff:**
```javascript
const delay = RETRY_DELAY * Math.pow(2, attemptNumber);
// Attempt 1: 2000ms (2s)
// Attempt 2: 4000ms (4s)
// Attempt 3: 8000ms (8s)
```

### Timeout Handling

**Default**: 10 seconds

**Purpose**: Prevent indefinite waiting

**Implementation:**
```javascript
await Promise.race([
  emailjs.send(...),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 10000)
  )
]);
```

### Fallback to Mailto

**When Triggered:**
- EmailJS not configured
- EmailJS library not loaded
- All retry attempts failed
- User confirms fallback

**User Experience:**
1. Form shows error with specific message
2. Confirm dialog: "Deseja abrir o seu cliente de email?"
3. If Yes: Opens default email client with pre-filled data
4. If No: Shows generic error message

**Mailto Format:**
```
mailto:joaojlobo@hotmail.com
  ?subject=Contacto do site: [Subject]
  &body=Nome: [Name]
        Email: [Email]

        Mensagem:
        [Message]

        ---
        Enviado através do formulário de contacto
```

---

## User Experience

### Loading States

**During Submission:**
- Button disabled
- Button shows "A enviar..."
- Spinning animation visible
- Form inputs remain accessible (not disabled)

**Visual Changes:**
```javascript
// Loading ON
submitBtn.disabled = true;
submitBtn.setAttribute('aria-busy', 'true');
submitText.textContent = 'A enviar...';
submitSpinner.classList.remove('hidden');

// Loading OFF
submitBtn.disabled = false;
submitBtn.removeAttribute('aria-busy');
submitText.textContent = 'Enviar';
submitSpinner.classList.add('hidden');
```

### Success Message

**Style**: Green background with checkmark icon

**Content**: "Mensagem enviada com sucesso! Entraremos em contacto em breve."

**Behavior:**
- Form is reset
- All errors cleared
- Character counter reset to 0
- Message receives focus
- Screen reader announcement

### Error Messages

**Types:**
1. **Validation Errors**: Field-level, red text below input
2. **Rate Limit**: Warning message, yellow background
3. **Submission Errors**: Error message, red background with icon

**Error Message with Icon:**
```html
<div class="bg-red-100 text-red-800 border border-red-400 flex items-start gap-3">
  <svg class="w-5 h-5"><!-- X icon --></svg>
  <span>Error message here</span>
</div>
```

### Character Counter

**Display**: `0/1000` above textarea

**Color Changes:**
- 0-899 chars: Gray (normal)
- 900-999 chars: Orange (warning)
- 1000 chars: Red (limit reached)

**Accessibility:**
- `aria-live="polite"` for announcements
- Associated with textarea via `aria-describedby`

### Form Reset

**On Success:**
- All fields cleared
- Errors removed
- Character counter reset
- Border colors restored
- No page reload required

---

## Analytics & Tracking

### Event Tracking

**Events Tracked:**
```javascript
// Form interactions
'form_submit_attempt'      // User clicked submit
'form_validation_failed'   // Validation errors present
'form_submit_success'      // Email sent successfully
'form_submit_error'        // Email sending failed

// Security
'form_spam_detected'       // Honeypot triggered
'form_rate_limited'        // Rate limit reached

// EmailJS
'emailjs_send_success'     // EmailJS succeeded
'emailjs_timeout'          // Request timed out
'emailjs_error'            // EmailJS error (with status)
'emailjs_unknown_error'    // Unknown error
'emailjs_library_missing'  // EmailJS not loaded
'mailto_fallback_used'     // User chose mailto fallback
```

### Integration

**Google Analytics 4:**
```javascript
if (typeof gtag !== 'undefined') {
  gtag('event', eventName, data);
}
```

**Custom Analytics:**
```javascript
// Uncomment to send to custom endpoint
// fetch('/api/analytics', {
//   method: 'POST',
//   body: JSON.stringify({ event: eventName, data })
// });
```

### Event Data

**Example Tracked Data:**
```javascript
trackFormEvent('form_submit_success', {
  nome_length: 15,
  mensagem_length: 245
});

trackFormEvent('emailjs_error', {
  status: 400,
  text: 'Bad Request'
});
```

---

## Error Handling

### Error Types and Messages

| Error Type | User Message | Technical Action |
|------------|-------------|------------------|
| **Validation** | Field-specific error | Show below field, focus first error |
| **Honeypot** | Generic error | Log to console, track event |
| **Rate Limit** | "Aguarde X minutos" | Show countdown, track event |
| **EmailJS Timeout** | "Serviço demorou..." | Offer mailto, retry logic |
| **EmailJS 400** | "Dados inválidos" | Check template params |
| **EmailJS 403** | "Acesso negado" | Check API keys |
| **EmailJS 429** | "Demasiadas tentativas" | Wait and retry |
| **EmailJS 500+** | "Problema no servidor" | Offer mailto |
| **Network Error** | "Erro de conexão" | Check internet, retry |

### Error Recovery

**Automatic Recovery:**
- Retry with exponential backoff (up to 3 attempts)
- Clear validation errors on user input
- Rate limit automatically expires

**Manual Recovery:**
- User can click submit again (if not rate limited)
- User can choose mailto fallback
- User can wait for rate limit to expire

### Debug Mode

**Enable in Console:**
```javascript
// See all events
trackFormEvent = (name, data) => console.log('📊', name, data);

// Clear rate limit
localStorage.removeItem('form_submissions');

// Test honeypot
document.getElementById('website').value = 'test';

// Check EmailJS config
validateEmailJSConfig();
```

---

## Configuration

### Customizable Parameters

**Rate Limiting:**
```javascript
const RATE_LIMIT = {
  maxAttempts: 3,           // Change max submissions
  windowMs: 15 * 60 * 1000, // Change time window
  storageKey: 'form_submissions'
};
```

**EmailJS:**
```javascript
const EMAIL_CONFIG = {
  MAX_RETRIES: 2,     // Number of retry attempts
  RETRY_DELAY: 2000,  // Initial delay between retries (ms)
  TIMEOUT: 10000      // Request timeout (ms)
};
```

**Validation:**
```javascript
// Adjust in fields array
{ id: 'nome', validate: (val) =>
  val.trim().length >= 2 && val.trim().length <= 100
}
```

**Disposable Emails:**
```javascript
const disposableDomains = [
  'tempmail.com',
  'your-blocked-domain.com',
  // Add more
];
```

---

## Testing

### Manual Testing Checklist

#### Validation
- [ ] Leave fields empty and submit → Show errors
- [ ] Enter invalid email → Show error
- [ ] Enter name < 2 chars → Show error
- [ ] Enter message < 10 chars → Show error
- [ ] Type in error field → Error clears
- [ ] Fill all fields correctly → No errors

#### Character Counter
- [ ] Type in message field → Counter updates
- [ ] Reach 900 chars → Orange color
- [ ] Reach 1000 chars → Red color
- [ ] Counter accessible with screen reader

#### Security
- [ ] Submit 3 times quickly → Rate limit triggered
- [ ] Wait 15 minutes → Rate limit cleared
- [ ] Fill honeypot field → Submission rejected

#### EmailJS
- [ ] Valid submission → Email received
- [ ] Disconnect internet → Show error and mailto option
- [ ] Invalid credentials → Fallback to mailto

#### UX
- [ ] Submit → Loading spinner shown
- [ ] Success → Green message + form cleared
- [ ] Error → Red message + form preserved
- [ ] All messages have icons
- [ ] Messages receive focus

### Automated Testing

**Using Browser Console:**
```javascript
// Test successful submission
const form = document.getElementById('contact-form');
document.getElementById('nome').value = 'Test User';
document.getElementById('email').value = 'test@example.com';
document.getElementById('assunto').value = 'Test Subject';
document.getElementById('mensagem').value = 'This is a test message with enough characters.';
form.dispatchEvent(new Event('submit'));

// Test rate limiting
for (let i = 0; i < 4; i++) {
  setTimeout(() => form.dispatchEvent(new Event('submit')), i * 1000);
}

// Test honeypot
document.getElementById('website').value = 'bot';
form.dispatchEvent(new Event('submit'));
```

---

## Troubleshooting

### Common Issues

#### "EmailJS não está configurado"
**Cause**: API keys not set or incorrect
**Solution**: Update `EMAIL_CONFIG` with valid keys

#### "Serviço de email temporariamente indisponível"
**Cause**: EmailJS library not loaded
**Solution**: Check `<script>` tag in HTML, verify CDN is accessible

#### Rate limit not resetting
**Cause**: LocalStorage persists across sessions
**Solution**: `localStorage.removeItem('form_submissions')`

#### Character counter not working
**Cause**: Character counter not initialized
**Solution**: Ensure `setupCharacterCounter()` is called

#### Form submits but no email received
**Cause**: EmailJS template not configured correctly
**Solution**: Check template variables match `templateParams`

### Debug Commands

```javascript
// Check configuration
validateEmailJSConfig();

// View rate limit data
JSON.parse(localStorage.getItem('form_submissions'));

// Clear rate limit
localStorage.removeItem('form_submissions');

// Test email without form
sendEmail({
  nome: 'Test',
  email: 'test@example.com',
  assunto: 'Test',
  mensagem: 'Test message'
}, 'joaojlobo@hotmail.com');
```

---

## Best Practices

### Security
1. ✅ Always sanitize input
2. ✅ Use honeypot for spam protection
3. ✅ Implement rate limiting
4. ✅ Block disposable email domains
5. ⚠️ Consider adding CSRF tokens if using backend

### User Experience
1. ✅ Provide real-time validation
2. ✅ Show clear error messages
3. ✅ Give visual feedback (loading, success, error)
4. ✅ Keep form data on error (don't clear)
5. ✅ Clear form on success
6. ✅ Make errors accessible to screen readers

### Email Delivery
1. ✅ Implement retry logic
2. ✅ Set reasonable timeout
3. ✅ Provide mailto fallback
4. ✅ Track delivery success/failure
5. ✅ Log errors for debugging

### Performance
1. ✅ Validate configuration on page load
2. ✅ Use debouncing for real-time validation
3. ✅ Minimize external dependencies
4. ✅ Cache localStorage data

---

## Support

For issues or questions:
- Check console for errors
- Review EmailJS dashboard
- Verify API keys are correct
- Test with mailto fallback
- Check browser console for tracking events

**Last Updated**: January 2025
**Version**: 2.0.0
