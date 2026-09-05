import { test, expect } from "@playwright/test";

test.describe("/login", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      throw err;
    });
    await page.goto("/login");
  });

  test("no envía el formulario con campos vacíos (validación del navegador)", async ({ page }) => {
    await page.locator('form button[type="submit"]').click();
    // Sigue en /login y el campo de correo queda marcado como inválido.
    await expect(page).toHaveURL(/\/login$/);
    const emailValido = await page
      .getByPlaceholder("tu@correo.com")
      .evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValido).toBe(false);
  });

  test("'¿Olvidaste tu contraseña?' cambia a la vista de recuperación", async ({ page }) => {
    await page.getByRole("button", { name: /olvidaste tu contraseña/i }).click();
    await expect(page.getByRole("heading", { name: "Recuperar contraseña" })).toBeVisible();
    await page.getByRole("button", { name: /volver a iniciar sesión/i }).click();
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("la pestaña 'Crear cuenta' muestra el campo de nombre", async ({ page }) => {
    await expect(page.getByLabel("Nombre completo")).toBeHidden();
    await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
    await expect(page.getByLabel("Nombre completo")).toBeVisible();
  });

  test("enlace desde /registro de vuelta a /login", async ({ page }) => {
    await page.goto("/registro");
    await page.getByRole("main").getByRole("link", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
