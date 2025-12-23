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
        // Notion/Slack influenced palette
        gray: {
          50: '#F9FAFB',  // Main background
          100: '#F3F4F6', // Secondary background (sidebar)
          200: '#E5E7EB', // Borders
          300: '#D1D5DB', // Disabled/Subtle borders
          500: '#6B7280', // Secondary text
          700: '#374151', // Primary text
          900: '#111827', // Headings
        },
        primary: {
          DEFAULT: '#0F172A', // Slate-900 (Professional dark blue/black for distinct actions)
          hover: '#334155',
        }
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"], // Fallback to standard light theme to avoid interference
    logs: false,
  },
};