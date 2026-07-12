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
        // PRIMARY: Plus Jakarta Sans — body text, navbar, buttons, subheadings, bold headlines
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // ACCENT SERIF: Playfair Display — exclusively for italic accent words inside headings
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
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
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--foreground) / <alpha-value>)",
        },
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        ring: "oklch(var(--ring) / <alpha-value>)",
        success: "oklch(var(--success) / <alpha-value>)",
        info: "oklch(var(--info) / <alpha-value>)",
        warning: "oklch(var(--warning) / <alpha-value>)",
        attention: "oklch(var(--attention) / <alpha-value>)",
        danger: "oklch(var(--danger) / <alpha-value>)",
        damaged: "oklch(var(--damaged) / <alpha-value>)",
        "neutral-state": "oklch(var(--neutral-state) / <alpha-value>)",
        pop: "oklch(var(--pop) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}
