/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystic: {
          900: '#0f172a',
          800: '#1e293b',
        },
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(1rem) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'reveal-glow': {
          '0%, 100%': {
            boxShadow: '0 0 24px rgba(251, 191, 36, 0.18), inset 0 0 60px rgba(251, 191, 36, 0.04)',
          },
          '50%': {
            boxShadow: '0 0 42px rgba(251, 191, 36, 0.32), inset 0 0 80px rgba(251, 191, 36, 0.07)',
          },
        },
        'ritual-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'message-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shake-error': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'loading-dot': {
          '0%, 80%, 100%': { opacity: '0.35', transform: 'scale(0.85)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.95s ease-out both',
        'reveal-glow': 'reveal-glow 3.2s ease-in-out infinite',
        'ritual-shimmer': 'ritual-shimmer 1.6s ease-in-out infinite',
        'page-enter': 'page-enter 0.4s ease-out both',
        'message-in': 'message-in 0.35s ease-out both',
        'shake-error': 'shake-error 0.55s ease-out both',
        'loading-dot': 'loading-dot 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

