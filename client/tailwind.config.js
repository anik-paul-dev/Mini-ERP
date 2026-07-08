/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)',
        'gradient-navbar': 'linear-gradient(90deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.97) 100%)',
        'gradient-stat': 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(51,65,85,0.7) 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.06)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(14, 165, 233, 0.15)',
        'navbar': '0 2px 16px -2px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
      },
    },
  },
  plugins: [],
}
