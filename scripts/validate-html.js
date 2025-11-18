/**
 * HTML Validation Script
 * Validates HTML markup using html-validator
 */

import validator from 'html-validator';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function validateHTML() {
  console.log('\n🔍 HTML Validation Started\n');

  try {
    // Find all HTML files
    const htmlFiles = await glob('**/*.html', {
      cwd: rootDir,
      ignore: ['node_modules/**', 'dist/**', 'coverage/**', '**/vendor/**'],
    });

    if (htmlFiles.length === 0) {
      console.log('⚠️  No HTML files found to validate');
      return;
    }

    console.log(`Found ${htmlFiles.length} HTML file(s) to validate:\n`);

    let totalErrors = 0;
    let totalWarnings = 0;
    const results = [];

    // Validate each file
    for (const file of htmlFiles) {
      const filePath = join(rootDir, file);
      const html = readFileSync(filePath, 'utf-8');

      console.log(`Validating: ${file}`);

      try {
        const result = await validator({
          data: html,
          format: 'json',
          validator: 'WHATWG', // Use WHATWG validator
        });

        const messages = JSON.parse(result).messages;

        const errors = messages.filter((m) => m.type === 'error');
        const warnings = messages.filter(
          (m) => m.type === 'info' && m.subType === 'warning'
        );

        totalErrors += errors.length;
        totalWarnings += warnings.length;

        results.push({
          file,
          errors,
          warnings,
        });

        if (errors.length === 0 && warnings.length === 0) {
          console.log(`  ✅ Valid\n`);
        } else {
          console.log(`  ⚠️  ${errors.length} error(s), ${warnings.length} warning(s)\n`);

          // Show errors
          if (errors.length > 0) {
            console.log('  Errors:');
            errors.forEach((error) => {
              console.log(`    ❌ Line ${error.lastLine}: ${error.message}`);
            });
            console.log('');
          }

          // Show warnings
          if (warnings.length > 0 && process.argv.includes('--verbose')) {
            console.log('  Warnings:');
            warnings.forEach((warning) => {
              console.log(`    ⚠️  Line ${warning.lastLine}: ${warning.message}`);
            });
            console.log('');
          }
        }
      } catch (error) {
        console.error(`  ❌ Error validating ${file}:`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('HTML Validation Summary');
    console.log('='.repeat(60));
    console.log(`Files validated: ${htmlFiles.length}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);

    if (totalErrors === 0) {
      console.log('\n✅ All HTML files are valid!\n');
      process.exit(0);
    } else {
      console.log('\n❌ HTML validation failed. Please fix the errors above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

validateHTML();
