import { test, expect, type Page } from "@playwright/test";

/**
 * Vistas con sesión del cliente. Solo lectura: carga la página, verifica que
 * no rebota a `/login` y que no hubo errores de runtime. No crea ni modifica
 * filas — el flujo wizard -> veredicto -> historial, que escribe en
 * `customs_queries`, queda para una segunda tanda con limpieza propia.
 */

test.use({ storageState: "e2e/.auth/cliente.json" });

function fallarAnteErrorDeRuntime(page: Page) {
  const errores: string[] = [];
  page.on("pageerror", (err) => errores.push(String(err)));
  return () => expect(errores, errores.join("\n")).toEqual([]);
}

const VISTAS: { ruta: string; encabezado: RegExp | string }[] = [
  { ruta: "/dashboard", encabezado: /^Hola,/ },
  { ruta: "/dashboard/historial", encabezado: "Historial de consultas" },
  { ruta: "/perfil", encabezado: "Mi Perfil" },
  { ruta: "/verificar-identidad", encabezado: "Verificar identidad" },
];

for (const { ruta, encabezado } of VISTAS) {
  test(`${ruta} carga con sesión`, async ({ page }) => {
    const sinErrores = fallarAnteErrorDeRuntime(page);

    await page.goto(ruta);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("main").locator("h1").first()).toContainText(encabezado);
    sinErrores();
  });
}

test("/consulta/nueva muestra el formulario de envío con sesión", async ({ page }) => {
  const sinErrores = fallarAnteErrorDeRuntime(page);

  await page.goto("/consulta/nueva");

  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("form")).toBeVisible();
  sinErrores();
});

test("el casillero deja entrar con KYC aprobado", async ({ page }) => {
  await page.goto("/casillero");

  // La cuenta e2e.cliente tiene kyc_status = 'aprobado' + términos aceptados,
  // así que RequireCompliance la deja pasar directo a Locker.
  await expect(page).toHaveURL(/\/casillero$/);
  await expect(page.getByRole("heading", { name: "Mi Casillero" })).toBeVisible();
});
