import { test as base } from '@playwright/test';
import { AppHeader } from '../components/app-header.component';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';

/** Page objects and shared components. Construction only: no navigation, no application actions. */
export const pagesTest = base.extend<{
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  appHeader: AppHeader;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  appHeader: async ({ page }, use) => {
    await use(AppHeader.of(page));
  },
});
