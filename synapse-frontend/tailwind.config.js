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
          950: '#050816',
          900: '#080d2a',
          800: '#0d1539',
          700: '#121c4a',
          600: '#1a255c',
        },
        indigo: {
          brand: '#6366f1',
          soft: '#818cf8',
          dark: '#4f46e5',
        },
        cyan: {
          accent: '#22d3ee',
          glow: 'rgba(34,211,238,0.15)',
        },
        semantic: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(34,211,238,0.2)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(34,211,238,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(34,211,238,0.5)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      }
    },
  },
  plugins: [],
}
