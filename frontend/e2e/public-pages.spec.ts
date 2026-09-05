import { test, expect, type Page } from "@playwright/test";

// Falla el test si la app tira un error de runtime en cualquier página.
function failOnPageError(page: Page) {
  page.on("pageerror", (err) => {
    throw err;
  });
}

const PAGINAS: { ruta: string; encabezado: RegExp | string }[] = [
  { ruta: "/", encabezado: /pasará la aduana/i },
  { ruta: "/pitch", encabezado: /pasará la aduana/i },
  { ruta: "/herramientas", encabezado: "Herramientas Interactivas" },
  { ruta: "/soporte", encabezado: "Centro de Ayuda" },
  { ruta: "/login", encabezado: "Iniciar sesión" },
  { ruta: "/registro", encabezado: "Crear cuenta" },
];

for (const { ruta, encabezado } of PAGINAS) {
  test(`${ruta} carga y muestra su encabezado`, async ({ page }) => {
    failOnPageError(page);
    await page.goto(ruta);
    await expect(page.getByRole("main").locator("h1").first()).toContainText(encabezado);
  });
}

test("la landing renderiza un encabezado principal", async ({ page }) => {
  failOnPageError(page);
  await page.goto("/landing");
  await expect(page.getByRole("main").locator("h1").first()).toBeVisible();
});

test("navegación por el navbar sin recargar la página", async ({ page }) => {
  failOnPageError(page);
  await page.goto("/");

  await page.locator('nav a[href="/herramientas"]').first().click();
  await expect(page).toHaveURL(/\/herramientas$/);
  await expect(page.getByRole("heading", { name: "Herramientas Interactivas" })).toBeVisible();

  await page.locator('nav a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
});
