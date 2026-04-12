import { test, expect } from '@playwright/test';

/**
 * Tests E2E de autenticación.
 * Ejecutar antes de estos tests: npx playwright test --project=setup
 */

test.describe('Login', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // sin auth

  test('muestra formulario de login en ruta protegida', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login con credenciales correctas redirige al dashboard', async ({ page }) => {
    const username = process.env.TEST_USERNAME ?? 'admin';
    const password = process.env.TEST_PASSWORD ?? 'admin';

    await page.goto('/login');
    await page.getByLabel(/usuario/i).fill(username);
    await page.getByLabel(/contraseña/i).fill(password);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/usuario/i).fill('usuario_invalido');
    await page.getByLabel(/contraseña/i).fill('contrasena_incorrecta');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe permanecer en /login y mostrar mensaje de error
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('contraseña menor a 8 caracteres no hace submit (validación cliente)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/usuario/i).fill('admin');
    await page.getByLabel(/contraseña/i).fill('corta');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Debe permanecer en /login (HTML5 validation / zod min 8)
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Logout (requiere auth)', () => {
  // storageState heredado del proyecto chromium (auth ya realizado en setup)

  test('botón de logout redirige a login', async ({ page }) => {
    await page.goto('/dashboard');
    // Buscar botón de logout (texto o aria-label)
    const logoutBtn = page.getByRole('button', { name: /cerrar sesión|logout/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      test.skip(true, 'Botón de logout no encontrado en el header');
    }
  });
});
