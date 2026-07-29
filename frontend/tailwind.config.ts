import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": { DEFAULT: "#1D4ED8", hover: "#2563EB" },
        "verdict-green": { bg: "#ECFDF5", text: "#059669", border: "#059669" },
        "verdict-amber": { bg: "#FFFBEB", text: "#D97706", border: "#D97706" },
        "verdict-red": { bg: "#FEF2F2", text: "#DC2626", border: "#DC2626" },
        "ai-accent": "#6366F1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
      },
      borderRadius: { xl: "0.75rem" },
    },
  },
  plugins: [],
} satisfies Config;
