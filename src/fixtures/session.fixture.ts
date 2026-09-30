import { expect, mergeTests } from '@playwright/test';
import type { InventoryPage } from '../pages/inventory.page';
import { dataTest } from './data.fixture';
import { pagesTest } from './pages.fixture';

/**
 * Opt-in fixtures that DO perform application actions. Request one only in tests that need it;
 * tests that do not ask for it never pay for the login.
 */
export const sessionTest = mergeTests(pagesTest, dataTest).extend<{
  /** The product list, reached by logging in as the standard user through the UI. */
  signedInInventory: InventoryPage;
}>({
  signedInInventory: async ({ loginPage, inventoryPage, users }, use) => {
    await loginPage.goto();
    await loginPage.login(users.standard);
    await expect(inventoryPage.products.first()).toBeVisible();
    await use(inventoryPage);
  },
});
