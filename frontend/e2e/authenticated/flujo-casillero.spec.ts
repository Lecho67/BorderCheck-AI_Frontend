import { test, expect, type Page } from "@playwright/test";

/**
 * Flujo con escritura real: el cliente con KYC aprobado crea una pre-alerta
 * (`insert_own_pre_alerts` exige `kyc_aprobado()`), la ve en la lista y la
 * borra. Se limpia solo — la política DELETE de `pre_alerts` es permisiva
 * para el dueño, así que no hace falta service-role key.
 *
 * `afterEach` barre cualquier fila de prueba que haya quedado de una corrida
 * anterior interrumpida (todas usan el mismo `CARRIER`).
 */

test.use({ storageState: "e2e/.auth/cliente.json" });

const CARRIER = "E2E Playwright";

async function borrarPreAlertasDePrueba(page: Page) {
  await page.goto("/casillero");
  await expect(page.getByRole("heading", { name: "Mi Casillero" })).toBeVisible();

  const filas = () => page.locator(".shadow-sm", { hasText: CARRIER });
  for (let restantes = await filas().count(); restantes > 0; restantes--) {
    await filas().first().getByTitle("Eliminar").click();
    await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
    await expect(filas()).toHaveCount(restantes - 1);
  }
}

test.afterEach(async ({ page }) => {
  await borrarPreAlertasDePrueba(page);
});

test("el cliente con KYC aprobado crea, ve y borra una pre-alerta", async ({ page }) => {
  const tracking = `E2E-${Date.now()}`;

  await page.goto("/casillero");
  await expect(page.getByRole("heading", { name: "Mi Casillero" })).toBeVisible();
  // KYC aprobado → sin banner de modo lectura.
  await expect(page.getByText(/verificación de identidad está en revisión/i)).toBeHidden();

  await page.getByRole("button", { name: "+ Pre-alertar paquete" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Pre-alertar paquete" })).toBeVisible();
  await dialog.getByLabel("Tienda de origen / Transportista").fill(CARRIER);
  await dialog.getByLabel("Número de rastreo de origen").fill(tracking);
  await dialog.getByLabel("Descripción del contenido").fill("Caja de prueba E2E");
  await dialog.getByLabel("Valor declarado (USD)").fill("25");
  await dialog.getByRole("button", { name: "Enviar pre-alerta" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(`${CARRIER} — ${tracking}`)).toBeVisible();

  // Borrado explícito (además del afterEach) para cubrir el camino de eliminar.
  await page.locator(".shadow-sm", { hasText: tracking }).getByTitle("Eliminar").click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();
  await expect(page.locator(".shadow-sm", { hasText: tracking })).toHaveCount(0);
});
