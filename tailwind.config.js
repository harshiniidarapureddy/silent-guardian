/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border, 215 25% 90%))",
        input: "hsl(var(--input, 215 25% 90%))",
        ring: "hsl(var(--ring, 173 80% 29%))",
        background: "hsl(var(--background, 210 40% 98%))",
        foreground: "hsl(var(--foreground, 222 47% 11%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 173 80% 29%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 215 25% 95%))",
          foreground: "hsl(var(--secondary-foreground, 222 47% 11%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 215 25% 95%))",
          foreground: "hsl(var(--muted-foreground, 215 16% 47%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 173 70% 94%))",
          foreground: "hsl(var(--accent-foreground, 173 80% 20%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 72% 51%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 100%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 222 47% 11%))",
        },
      },
    },
  },
  plugins: [],
}
