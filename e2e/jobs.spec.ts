import { test, expect } from '@playwright/test';

/**
 * Tests E2E de la sección de Trabajos (Jobs).
 * Requieren autenticación previa (auth.setup.ts).
 */

test.describe('Página de Trabajos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
    // Esperar a que desaparezca el skeleton / spinner
    await page.waitForSelector('[role="progressbar"], table, [data-testid="jobs-empty"]', {
      timeout: 15_000,
    });
  });

  test('carga y muestra la lista de trabajos (o estado vacío)', async ({ page }) => {
    const hasJobs = await page.locator('table tbody tr').count();
    const isEmpty = await page.locator('[data-testid="jobs-empty"]').isVisible().catch(() => false);

    expect(hasJobs > 0 || isEmpty).toBeTruthy();
  });

  test('muestra progreso accesible (ARIA progressbar)', async ({ page }) => {
    const progressbars = page.locator('[role="progressbar"]');
    const count = await progressbars.count();

    if (count > 0) {
      const first = progressbars.first();
      await expect(first).toHaveAttribute('aria-valuenow');
      await expect(first).toHaveAttribute('aria-valuemin', '0');
      await expect(first).toHaveAttribute('aria-valuemax', '100');
    }
  });

  test('el botón de actualizar refresca la lista', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /actualizar|refresh/i });
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      // Esperar brevemente sin usar sleep
      await page.waitForLoadState('networkidle');
    }
  });
});
