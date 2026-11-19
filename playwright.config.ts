import { defineConfig, devices } from '@playwright/test';

const port = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // Liefert dist/ mit den Headern aus netlify.toml aus (scripts/serve-dist.mjs).
    command: 'node scripts/serve-dist.mjs',
    url: `http://localhost:${port}/robots.txt`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port) },
  },
});
