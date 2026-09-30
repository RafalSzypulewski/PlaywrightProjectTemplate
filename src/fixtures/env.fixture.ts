import { test as base } from '@playwright/test';
import { env, type Env } from '../../config/env';

/** Typed configuration. Worker-scoped: immutable and identical for every test in a worker. */
export const envTest = base.extend<object, { env: Env }>({
  env: [
    async ({}, use) => {
      await use(env);
    },
    { scope: 'worker' },
  ],
});
