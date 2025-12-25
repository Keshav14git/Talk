import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Linear-inspired dark palette
        gray: {
          900: '#0f1115', // Main background
          800: '#161920', // Surface (Sidebar/Cards)
          700: '#22252a', // Borders/Separators
          600: '#2e333d', // Hover states
          500: '#6b7280', // Text secondary
          400: '#9ca3af', // Text tertiary
          300: '#d1d5db',
          100: '#e5e7eb', // Text primary (almost white)
          50: '#f9fafb',
        },
        primary: {
          DEFAULT: '#FF5636', // Brand Orange
          hover: '#E04529',
          glow: 'rgba(255, 86, 54, 0.15)'
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 86, 54, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["dark", "light"],
    darkTheme: "dark",
    logs: false,
  },
};