/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'med-bg': '#070d1a',
        'med-card': '#0e1624',
        'med-border': '#1a2740',
        'med-cyan': '#00d4ff',
        'med-green': '#10b981',
        'med-red': '#ef4444',
        'med-orange': '#f97316',
        'med-yellow': '#eab308',
        'med-purple': '#8b5cf6',
      },
      animation: {
        'pulse-vital': 'pulseVital 1.5s ease-in-out infinite',
        'flatline': 'flatline 2s linear infinite',
        'blink-dot': 'blinkDot 1s step-end infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseVital: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.95)' },
        },
        flatline: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        blinkDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
