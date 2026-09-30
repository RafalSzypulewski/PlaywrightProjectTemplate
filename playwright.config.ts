import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

// API specs run once in the browserless 'api' project, not once per browser.
const apiTests = /[\\/]tests[\\/]api[\\/]/;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 1 : 0,
  workers: env.workers ?? (env.isCI ? 2 : '50%'),

  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: env.isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // Logs in once per role and saves storageState to .auth/. Trace, video and screenshots are
      // off because they would capture credentials and session cookies.
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], trace: 'off', video: 'off', screenshot: 'off' },
    },
    {
      // Standalone API tests: no browser, no UI session.
      name: 'api',
      testMatch: apiTests,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: apiTests,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: apiTests,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: apiTests,
    },
  ],
});
