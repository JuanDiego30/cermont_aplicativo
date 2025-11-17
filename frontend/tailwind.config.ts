// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f7fd',
          100: '#e4edfa',
          200: '#c3daf4',
          300: '#8fbcea',
          400: '#5399dd',
          500: '#2d7cca',
          600: '#1d5fa8', // Color principal CERMONT
          700: '#194e8b',
          800: '#194373',
          900: '#1a3960',
          950: '#112440',
        },
        secondary: {
          50: '#F0F9F3',
          100: '#E1F3E7',
          200: '#C3E7CF',
          300: '#A5DBB7',
          400: '#87CF9F',
          500: '#3FA550', // Verde CERMONT
          600: '#328440',
          700: '#266330',
          800: '#194220',
          900: '#0D2110',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        success: { 500: '#10B981', 600: '#059669' },
        error: { 500: '#EF4444', 600: '#DC2626' },
        warning: { 500: '#F59E0B', 600: '#D97706' },
        info: { 500: '#3B82F6', 600: '#2563EB' },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

