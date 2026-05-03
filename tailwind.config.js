/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fd',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#1e3a8a',
          700: '#1e2e6e',
          800: '#1a2554',
          900: '#0f172a',
        },
        mint: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        }
      }
    },
  },
  plugins: [],
}
