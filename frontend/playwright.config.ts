import { defineConfig, devices } from "@playwright/test";

/**
 * E2E de páginas públicas (sin login). Cubre carga, navegación y validación
 * del formulario de login — nada que necesite sesión ni backend real.
 *
 * Requiere el binario del navegador: `npx playwright install chromium`.
 * Ejecutar: `npm run test:e2e` (o `npm run test:e2e:ui`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
