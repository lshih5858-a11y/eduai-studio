/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f8',
          100: '#d7ddef',
          200: '#b0bcdf',
          300: '#8494c9',
          400: '#5b6cad',
          500: '#3d4c8c',
          600: '#2b386c',
          700: '#1f2a52',
          800: '#161d3b',
          900: '#0d1226',
        },
        mint: {
          50: '#e9fbf6',
          100: '#c8f4e7',
          200: '#9dead4',
          300: '#6adcbe',
          400: '#3ccba6',
          500: '#1fb28c',
          600: '#158e70',
          700: '#106f58',
          800: '#0c5443',
          900: '#083a2e',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(13, 18, 38, 0.08)',
        cardHover: '0 8px 32px rgba(13, 18, 38, 0.14)',
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
}
