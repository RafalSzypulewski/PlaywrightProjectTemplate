import { mergeTests } from '@playwright/test';
import { dataTest } from './data.fixture';
import { envTest } from './env.fixture';
import { pagesTest } from './pages.fixture';
import { sessionTest } from './session.fixture';

export { expect } from '@playwright/test';

/** The only `test` specs should import. Compose new fixture modules here with `mergeTests`. */
export const test = mergeTests(envTest, dataTest, pagesTest, sessionTest);
