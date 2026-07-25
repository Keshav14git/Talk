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
        // ChatGPT-Inspired Dark Palette
        gray: {
          950: '#0d0d0d', // Deepest background
          900: '#171717', // Sidebar / primary bg
          800: '#212121', // Main content bg
          700: '#2f2f2f', // Cards / surfaces
          600: '#424242', // Borders / hover
          500: '#6e6e6e', // Muted text
          400: '#b4b4b4', // Secondary text
          300: '#d1d1d1', // Primary text
          200: '#ececec', // Bright text
          100: '#f5f5f5', // Near-white
          50: '#fafafa',  // Pure white text
        },
        primary: {
          DEFAULT: '#ffffff',
          hover: '#e5e5e5',
          glow: 'rgba(255, 255, 255, 0.08)'
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 255, 255, 0.06)',
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