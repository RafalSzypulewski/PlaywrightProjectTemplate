import { expect, test } from '@playwright/test';
import { InventoryPage } from '../src/pages/inventory.page';
import { LoginPage } from '../src/pages/login.page';

// Public demo credentials published by the demo application.
const validUser = { username: 'standard_user', password: 'secret_sauce' };
const backpack = 'Sauce Labs Backpack';

test.describe('inventory', { tag: '@smoke' }, () => {
  let inventory: InventoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser);
    inventory = new InventoryPage(page);
  });

  test('lists the available products', async () => {
    await expect(inventory.products).toHaveCount(6);
    await expect(inventory.product(backpack).price).toHaveText('$29.99');
  });

  test('adding a product shows it in the cart badge', async () => {
    const card = inventory.product(backpack);

    await card.addToCart();

    await expect(inventory.header.cartBadge).toHaveText('1');
    await expect(card.removeButton).toBeVisible();
  });

  test('removing a product empties the cart badge', async () => {
    const card = inventory.product(backpack);
    await card.addToCart();

    await card.removeFromCart();

    await expect(inventory.header.cartBadge).toBeHidden();
    await expect(card.addToCartButton).toBeVisible();
  });

  test('opening the cart navigates to the cart page', async ({ page }) => {
    await inventory.header.openCart();

    await expect(page).toHaveURL(/cart.html/);
  });

  test('user can log out from the header menu', async ({ page }) => {
    await inventory.header.logout();

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(new LoginPage(page).loginButton).toBeVisible();
  });
});
