import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración E2E para SynaptoLabsIA-UI.
 * Variables de entorno necesarias:
 *   BASE_URL   — URL del frontend (default: http://localhost:3000)
 *   TEST_USERNAME — usuario de prueba (default: admin)
 *   TEST_PASSWORD — contraseña de prueba (default: admin)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    // Permite que las cookies httpOnly sean enviadas automáticamente
    storageState: undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Proyecto de setup: realiza login y guarda estado de autenticación
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Proyecto principal: usa el estado guardado por setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
