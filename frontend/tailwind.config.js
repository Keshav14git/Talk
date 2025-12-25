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
        // Pure Black / Monochrome Palette
        gray: {
          900: '#000000', // Pure Black
          800: '#0a0a0a', // Almost Black (Surface)
          700: '#1a1a1a', // Subtle Border
          600: '#262626', // Hover
          500: '#525252', // Text secondary
          400: '#a3a3a3', // Text tertiary
          300: '#d4d4d4',
          100: '#ffffff', // Pure White Text
          50: '#fafafa',
        },
        primary: {
          DEFAULT: '#ffffff', // White is the new "Primary"
          hover: '#e5e5e5', // Light Gray hover
          glow: 'rgba(255, 255, 255, 0.1)' // White glow
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 255, 255, 0.1)', // White glow
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
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