import { test as base, type BrowserContext } from '@playwright/test';
import { authFile, type Role } from '../auth/state';

/**
 * Multi-role support. Returns a new browser context signed in as the given role, for tests that
 * need two identities at once. Contexts are closed after the test. They do not inherit
 * trace/video settings; single-role tests should use `test.use({ storageState })` instead.
 */
export const authTest = base.extend<{ contextAs: (role: Role) => Promise<BrowserContext> }>({
  contextAs: async ({ browser, baseURL }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (role) => {
      const context = await browser.newContext({ baseURL, storageState: authFile(role) });
      contexts.push(context);
      return context;
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});
