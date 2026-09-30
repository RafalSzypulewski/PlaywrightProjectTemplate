import { authFile } from '../src/auth/state';
import { expect, test } from '../src/fixtures';

const backpack = 'Sauce Labs Backpack';

// Start every test already signed in as `standard` (session saved by the setup project).
test.use({ storageState: authFile('standard') });

test.describe('inventory', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists the available products', async ({ inventoryPage }) => {
    await expect(inventoryPage.products).toHaveCount(6);
    await expect(inventoryPage.product(backpack).price).toHaveText('$29.99');
  });

  test('adding a product shows it in the cart badge', async ({ inventoryPage, appHeader }) => {
    const card = inventoryPage.product(backpack);

    await card.addToCart();

    await expect(appHeader.cartBadge).toHaveText('1');
    await expect(card.removeButton).toBeVisible();
  });

  test('removing a product empties the cart badge', async ({ inventoryPage, appHeader }) => {
    const card = inventoryPage.product(backpack);
    await card.addToCart();

    await card.removeFromCart();

    await expect(appHeader.cartBadge).toBeHidden();
    await expect(card.addToCartButton).toBeVisible();
  });

  test('opening the cart navigates to the cart page', async ({ page, appHeader }) => {
    await appHeader.openCart();

    await expect(page).toHaveURL(/cart\.html/);
  });

  test('user can log out from the header menu', async ({ page, appHeader, loginPage }) => {
    await appHeader.logout();

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
