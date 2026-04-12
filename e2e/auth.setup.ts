import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

/**
 * Fixture de autenticación.
 * Realiza el login y guarda las cookies en playwright/.auth/user.json
 * para ser reutilizado en el resto de los tests E2E.
 */
setup('authenticate', async ({ page }) => {
  const username = process.env.TEST_USERNAME ?? 'admin';
  const password = process.env.TEST_PASSWORD ?? 'admin';

  await page.goto('/login');

  await page.getByLabel(/usuario/i).fill(username);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Verifica que redirigió al dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Guarda el estado de autenticación (cookies httpOnly incluidas)
  await page.context().storageState({ path: authFile });
});
