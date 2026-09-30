import { test as base } from '@playwright/test';
import { users, type Users } from '../data/users';

/**
 * Test data. Each test receives its own copy, so mutations cannot leak between tests.
 * Fixtures that create data (e.g. through an API) belong here: create before `use()`,
 * clean up after it.
 */
export const dataTest = base.extend<{ users: Users }>({
  users: async ({}, use) => {
    await use(structuredClone(users));
  },
});
