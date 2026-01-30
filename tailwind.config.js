/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './index.html',
    './sobre.html',
    './legado.html',
    './contacto.html',
    './leis-recentes.html',
    './areas-pratica.html',
    './src/**/*.{js,ts,jsx,tsx,html,css}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#B91C1C',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#B91C1C',
        },
        secondary: {
          50: '#fdf8f0',
          100: '#f9ecd9',
          200: '#f0d9b3',
          300: '#e5c28a',
          400: '#d4af6a',
          500: '#c9a14a',
          DEFAULT: '#c9a14a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'brand': '0 4px 14px -2px rgba(185, 28, 28, 0.12), 0 2px 6px -2px rgba(0,0,0,0.05)',
        'brand-lg': '0 20px 25px -5px rgba(185, 28, 28, 0.08), 0 8px 10px -6px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
