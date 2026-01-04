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
        // New accent variant for secondary actions
        'accent-cyan': {
          DEFAULT: '#22d3ee',
          hover: '#06b6d4',
          glow: 'rgba(34, 211, 238, 0.15)',
          strong: '#67e8f9',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
