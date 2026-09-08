import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Identidad Easy CUSTOMS ---
        // Cobalto: color dominante — fondos oscuros, encabezados sobre claro,
        // botones primarios y estructura. Es un color de texto válido.
        cobalt: {
          DEFAULT: "#0F2C59",
          600: "#1B4488",
          900: "#0A1F40",
        },
        // Cian: SOLO acento — highlights, líneas de movimiento, indicadores,
        // degradados. REGLA DURA: nunca en texto de cuerpo o descriptivo.
        cian: {
          DEFAULT: "#00A8E8",
          light: "#4FCBF2",
        },
        // Papel: fondos claros, superficies de tarjeta, texto claro sobre cobalto.
        papel: {
          DEFAULT: "#F8F9FA",
          tint: "#E8F9FA",
        },

        // Alias de compatibilidad — la app usa `brand-blue`/`ai-accent` en ~50
        // archivos. Ambos apuntan a cobalto: así `text-ai-accent` (usado en
        // varios lados) nunca resuelve a cian. Migrar a `cobalt`/`cian` de a poco.
        "brand-blue": { DEFAULT: "#0F2C59", hover: "#1B4488" },
        "ai-accent": "#0F2C59",

        // Veredictos: exclusivos para estados de diagnóstico, sin cambios.
        "verdict-green": { bg: "#ECFDF5", text: "#059669", border: "#059669" },
        "verdict-amber": { bg: "#FFFBEB", text: "#D97706", border: "#D97706" },
        "verdict-red": { bg: "#FEF2F2", text: "#DC2626", border: "#DC2626" },
      },
      fontFamily: {
        sans: ["Jost", "Century Gothic", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Roboto Mono", "monospace"],
      },
      borderRadius: { xl: "0.75rem" },
    },
  },
  plugins: [],
} satisfies Config;
