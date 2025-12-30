/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Studio palette
        surface: {
          DEFAULT: '#141414',
          deep: '#0a0a0a',
          elevated: '#1f1f1f',
          overlay: '#262626',
        },
        border: {
          DEFAULT: '#2a2a2a',
          subtle: '#1f1f1f',
          focus: '#404040',
        },
        accent: {
          DEFAULT: '#00d4ff',
          hover: '#00b8e6',
          muted: '#00d4ff20',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
