import { expect, type Browser } from '@playwright/test';
import type { RoleCredentials } from '../../config/env';
import { LoginPage } from '../pages/login.page';
import { authFile, hasFreshState, type Role } from './state';

export interface AuthDeps {
  browser: Browser;
  baseURL: string | undefined;
  credentials: RoleCredentials;
}

type Authenticator = (role: Role, deps: AuthDeps) => Promise<void>;

/** Logs in through the UI and saves the session. Use when the app offers no login API. */
const loginViaUi: Authenticator = async (role, { browser, baseURL, credentials }) => {
  const context = await browser.newContext({ baseURL });
  try {
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials);
    await expect(page).toHaveURL(/inventory\.html/);
    await context.storageState({ path: authFile(role) });
  } finally {
    await context.close();
  }
};

// Login method per role. Prefer API login when the app has one: create an APIRequestContext
// (`playwright.request.newContext({ baseURL })`), POST the credentials, then
// `request.storageState({ path: authFile(role) })`. It is faster and needs no browser.
// The demo application only offers UI login.
const authenticators: Record<Role, Authenticator> = {
  standard: loginViaUi,
  problem: loginViaUi,
};

export function authenticate(role: Role, deps: AuthDeps): Promise<void> {
  return authenticators[role](role, deps);
}

/** Authenticates unless a fresh saved session exists. Returns what happened, for reporting. */
export async function ensureSession(
  role: Role,
  deps: AuthDeps,
  maxAgeMinutes: number,
): Promise<'reused' | 'created'> {
  if (hasFreshState(role, maxAgeMinutes)) return 'reused';
  await authenticate(role, deps);
  return 'created';
}
