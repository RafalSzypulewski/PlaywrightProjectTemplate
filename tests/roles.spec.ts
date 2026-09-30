import { authFile } from '../src/auth/state';
import { AppHeader } from '../src/components/app-header.component';
import { expect, test } from '../src/fixtures';
import { InventoryPage } from '../src/pages/inventory.page';

test.use({ storageState: authFile('standard') });

test(
  'two roles in one test have independent sessions',
  { tag: ['@e2e', '@regression'] },
  async ({ inventoryPage, appHeader, contextAs }) => {
    await inventoryPage.goto();
    await inventoryPage.product('Sauce Labs Backpack').addToCart();
    await expect(appHeader.cartBadge).toHaveText('1');

    const problemPage = await (await contextAs('problem')).newPage();
    await new InventoryPage(problemPage).goto();

    await expect(AppHeader.of(problemPage).cartBadge).toBeHidden();
  },
);
