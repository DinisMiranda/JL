module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'prettier', // Make sure this is last to override other configs
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['import', 'jsx-a11y'],
  rules: {
    // Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['warn', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-with': 'error',

    // ES6+
    'prefer-const': 'warn',
    'no-var': 'error',
    'arrow-spacing': 'warn',
    'template-curly-spacing': ['warn', 'never'],
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    'prefer-arrow-callback': 'warn',

    // Import
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    'import/no-duplicates': 'warn',
    'import/newline-after-import': 'warn',

    // Accessibility
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn',

    // Security
    'no-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
  },
  overrides: [
    {
      // Jest test files
      files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
      extends: ['plugin:jest/recommended'],
      plugins: ['jest'],
      env: {
        jest: true,
      },
      rules: {
        'jest/expect-expect': 'warn',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/valid-expect': 'error',
      },
    },
    {
      // Playwright test files
      files: ['**/*.e2e.js', '**/e2e/**/*.js', 'playwright.config.js'],
      extends: ['plugin:playwright/recommended'],
      plugins: ['playwright'],
      rules: {
        'playwright/no-wait-for-timeout': 'warn',
        'playwright/no-element-handle': 'warn',
      },
    },
  ],
  ignorePatterns: ['dist', 'node_modules', '*.config.js', 'coverage'],
};
