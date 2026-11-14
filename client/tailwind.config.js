/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cocoa: {
          950: '#120804',
          900: '#1c0d07',
          850: '#251209',
          800: '#32190d',
          700: '#482414',
          600: '#64321d',
          500: '#844427',
          400: '#a75d38',
          300: '#cb8156',
          200: '#e5ab87',
          100: '#f4d5c1',
          50: '#fcf6f2',
        },
        gold: {
          50: '#fcfaf0',
          100: '#f8f2d8',
          200: '#f0e3ad',
          300: '#e6cd77',
          400: '#dbb644',
          500: '#cb9e28',
          600: '#af7e1d',
          700: '#8c5d19',
          800: '#734a1a',
          900: '#613e1a',
        },
        velvet: {
          950: '#220610',
          900: '#3c0a1d',
          800: '#5a0f2b',
          700: '#7f153c',
          600: '#a51c4f',
          500: '#c72562',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive']
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(4deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(14px) rotate(-4deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'float-reverse 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
        marquee: 'marquee 30s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'spin-slow': 'spinSlow 20s linear infinite',
      }
    },
  },
  plugins: [],
}
