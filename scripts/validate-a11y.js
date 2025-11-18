/**
 * Accessibility Validation Script
 * Validates accessibility using pa11y
 */

import pa11y from 'pa11y';

const URLS = [
  'http://localhost:5173/',
  'http://localhost:5173/#services',
  'http://localhost:5173/#about',
  'http://localhost:5173/#contact',
];

const CONFIG = {
  // Standard to test against
  standard: 'WCAG2AA',

  // Viewport size
  viewport: {
    width: 1280,
    height: 1024,
  },

  // Screenshot on error (optional)
  screenCapture: process.argv.includes('--screenshot') ? './a11y-screenshot.png' : null,

  // Timeout
  timeout: 30000,

  // Wait for page to load
  wait: 1000,

  // Include warnings
  includeWarnings: true,

  // Include notices
  includeNotices: false,

  // Runners (htmlcs for WCAG, axe for additional checks)
  runners: ['htmlcs', 'axe'],

  // Ignore specific rules if needed
  ignore: [
    // Example: 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail',
  ],
};

async function validateAccessibility() {
  console.log('\n♿ Accessibility Validation Started\n');
  console.log(`Testing against: ${CONFIG.standard}`);
  console.log(`URLs to test: ${URLS.length}\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const url of URLS) {
    console.log(`Testing: ${url}`);

    try {
      const result = await pa11y(url, CONFIG);

      const errors = result.issues.filter((issue) => issue.type === 'error');
      const warnings = result.issues.filter((issue) => issue.type === 'warning');

      totalErrors += errors.length;
      totalWarnings += warnings.length;

      results.push({
        url,
        errors,
        warnings,
        documentTitle: result.documentTitle,
      });

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  ✅ No accessibility issues found\n`);
      } else {
        console.log(`  ⚠️  ${errors.length} error(s), ${warnings.length} warning(s)\n`);

        // Show errors
        if (errors.length > 0) {
          console.log('  Errors:');
          errors.slice(0, 10).forEach((error) => {
            console.log(`    ❌ ${error.code}`);
            console.log(`       ${error.message}`);
            console.log(`       Selector: ${error.selector}`);
            console.log('');
          });

          if (errors.length > 10) {
            console.log(`    ... and ${errors.length - 10} more errors\n`);
          }
        }

        // Show warnings (if verbose)
        if (warnings.length > 0 && process.argv.includes('--verbose')) {
          console.log('  Warnings:');
          warnings.slice(0, 5).forEach((warning) => {
            console.log(`    ⚠️  ${warning.code}`);
            console.log(`       ${warning.message}`);
            console.log(`       Selector: ${warning.selector}`);
            console.log('');
          });

          if (warnings.length > 5) {
            console.log(`    ... and ${warnings.length - 5} more warnings\n`);
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ Error testing ${url}:`, error.message);
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Accessibility Validation Summary');
  console.log('='.repeat(60));
  console.log(`URLs tested: ${URLS.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);

  // Categorize errors
  if (results.length > 0) {
    const errorTypes = {};
    results.forEach((result) => {
      result.errors.forEach((error) => {
        const type = error.code.split('.')[0];
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
    });

    if (Object.keys(errorTypes).length > 0) {
      console.log('\nError types:');
      Object.entries(errorTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count}`);
        });
    }
  }

  if (totalErrors === 0) {
    console.log('\n✅ All pages meet accessibility standards!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Accessibility validation failed. Please fix the errors above.\n');
    console.log('💡 Tips:');
    console.log('  - Ensure all images have alt text');
    console.log('  - Verify proper heading hierarchy (h1, h2, h3...)');
    console.log('  - Check color contrast ratios (4.5:1 for normal text)');
    console.log('  - Ensure form inputs have labels');
    console.log('  - Test keyboard navigation\n');
    process.exit(1);
  }
}

// Check if server is needed
if (process.argv.includes('--no-server')) {
  validateAccessibility();
} else {
  console.log('⚠️  Make sure the development server is running!');
  console.log('Run: npm run dev\n');
  validateAccessibility();
}
