import { test, expect, type Page } from "@playwright/test";

/**
 * Flujo: el cliente completa el wizard de envío y llega al veredicto.
 *
 * El motor de reglas está forzado al mock (`evaluarEnvioMock`) vía
 * `webServer.env` en `playwright.config.ts`, así que el resultado es
 * determinístico: una descripción de ropa cae en "Apto para envío" (verde).
 *
 * El mock NO escribe en `customs_queries` (solo el backend real lo hace), así
 * que este flujo no deja filas y no necesita teardown. La parte
 * "veredicto -> historial" con persistencia real queda pendiente hasta tener
 * limpieza por corrida (service-role key).
 */

test.use({ storageState: "e2e/.auth/cliente.json" });

async function elegirSelect(page: Page, triggerActual: string | RegExp, opcion: string) {
  await page.getByRole("button", { name: triggerActual }).first().click();
  await page.getByPlaceholder("Buscar...").fill(opcion);
  await page.getByRole("button", { name: opcion, exact: true }).click();
}

test("el wizard de envío llega a un veredicto", async ({ page }) => {
  const errores: string[] = [];
  page.on("pageerror", (err) => errores.push(String(err)));

  await page.goto("/consulta/nueva");
  await expect(page.locator("form")).toBeVisible();

  // Logística
  await elegirSelect(page, "Selecciona un país", "Estados Unidos");
  await elegirSelect(page, "Selecciona una opción", "Aéreo");
  await elegirSelect(page, "Selecciona una opción", "Envío personal / regalo");

  // Destino y producto
  await elegirSelect(page, "Selecciona un país", "Colombia");
  await page
    .getByPlaceholder("Ej. Audífonos inalámbricos con estuche de carga")
    .fill("Camiseta de algodón, regalo personal");

  // Detalles del envío
  await page.getByLabel("Peso (kg) *").fill("1.5");
  await page.getByLabel("Valor declarado (USD) *").fill("40");

  await page.getByRole("button", { name: "Evaluar envío" }).click();

  // El mock demora ~3s y navega a /consulta/:id
  await page.waitForURL(/\/consulta\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  await expect(page.getByText("Apto para envío")).toBeVisible();
  await expect(page.getByText("Guardado en tu historial")).toBeVisible();
  await expect(page.getByRole("button", { name: /Ver historial/ })).toBeVisible();

  expect(errores, errores.join("\n")).toEqual([]);
});

test("una descripción con batería de litio pide documentación (veredicto ámbar)", async ({
  page,
}) => {
  await page.goto("/consulta/nueva");
  await elegirSelect(page, "Selecciona un país", "México");
  await elegirSelect(page, "Selecciona una opción", "Aéreo");
  await elegirSelect(page, "Selecciona una opción", "Envío comercial");
  await elegirSelect(page, "Selecciona un país", "Chile");
  await page
    .getByPlaceholder("Ej. Audífonos inalámbricos con estuche de carga")
    .fill("Power bank con batería de litio de 20000 mAh");
  await page.getByLabel("Peso (kg) *").fill("0.4");
  await page.getByLabel("Valor declarado (USD) *").fill("35");
  await page.getByRole("button", { name: "Evaluar envío" }).click();

  await page.waitForURL(/\/consulta\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  await expect(page.getByText("Requiere documentación adicional")).toBeVisible();
});
