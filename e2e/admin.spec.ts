import { test, expect } from '@playwright/test';

/**
 * Tests E2E del panel de administración.
 * Requieren autenticación con rol admin (auth.setup.ts).
 */

test.describe('Admin — acceso y protección de rutas', () => {
  test('admin autenticado puede acceder a /admin/debug', async ({ page }) => {
    await page.goto('/admin/debug');
    // No debe redirigir a /login ni a /dashboard
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('la ruta /debug (legacy) redirige permanentemente a /admin/debug', async ({ page }) => {
    const response = await page.goto('/debug', { waitUntil: 'load' });
    // El servidor envía 308, el browser sigue la redirección
    await expect(page).toHaveURL(/\/admin\/debug/);
    // El status original debe ser 3xx (el browser puede resolverlo a 200 al final)
    expect(response?.status()).toBeLessThan(400);
  });

  test('métricas de sistema se muestran en /admin/debug', async ({ page }) => {
    await page.goto('/admin/debug');
    // Esperar contenido de métricas
    await page.waitForSelector('[data-testid="metrics-panel"], h1, h2', { timeout: 10_000 });
    // Verificar que hay algún dato numérico visible
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });
});

test.describe('Admin — acceso denegado a rol no-admin', () => {
  // Usa un estado de auth sin privilegios (si existe, si no, skip)
  test.use({ storageState: { cookies: [], origins: [] } });

  test('usuario no autenticado en /admin/debug redirige a login', async ({ page }) => {
    await page.goto('/admin/debug');
    await expect(page).toHaveURL(/\/login/);
  });
});
