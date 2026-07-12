/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // PRIMARY: Geist Sans — matches Vercel reference exactly (design.md §3)
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        // MONOSPACE: Geist Mono — asset tags, serials, IDs, timestamps
        mono: ['"Geist Mono"', 'monospace'],
      },
      animation: {
        'subtle-zoom': 'subtle-zoom 25s ease-out infinite alternate',
        'fade-in-up': 'fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
      },
      keyframes: {
        'subtle-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "card-hover": "rgb(var(--card-hover) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        "muted-foreground-2": "rgb(var(--muted-foreground-2) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
          hover: "rgb(var(--card-hover) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        ring: "rgb(var(--ring) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        attention: "rgb(var(--attention) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        damaged: "rgb(var(--damaged) / <alpha-value>)",
        "neutral-state": "rgb(var(--neutral-state) / <alpha-value>)",
        pop: "rgb(var(--pop) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}
