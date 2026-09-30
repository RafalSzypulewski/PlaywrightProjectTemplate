import { mergeTests } from '@playwright/test';
import { apiTest } from './api.fixture';
import { authTest } from './auth.fixture';
import { dataTest } from './data.fixture';
import { envTest } from './env.fixture';
import { pagesTest } from './pages.fixture';

export { expect } from '@playwright/test';

/** The only `test` specs should import. Compose new fixture modules here with `mergeTests`. */
export const test = mergeTests(envTest, dataTest, pagesTest, authTest, apiTest);
