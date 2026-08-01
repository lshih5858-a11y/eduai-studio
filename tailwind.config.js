/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf6',
          100: '#d7f2e8',
          200: '#b0e4d2',
          300: '#7ccfb6',
          400: '#48b298',
          500: '#26957d',
          600: '#187a67',
          700: '#146254',
          800: '#134e44',
          900: '#0f3f39',
          950: '#082521',
        },
        accent: {
          50: '#fdf8ec',
          100: '#faedc9',
          200: '#f4d98e',
          300: '#eec066',
          400: '#e8a93f',
          500: '#dd9127',
          600: '#c0721d',
          700: '#9f541c',
          800: '#82421d',
          900: '#6c371c',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
