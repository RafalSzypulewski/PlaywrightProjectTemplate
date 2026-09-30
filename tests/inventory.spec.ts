import { expect, test } from '../src/fixtures';

const backpack = 'Sauce Labs Backpack';

test.describe('inventory', { tag: '@smoke' }, () => {
  test('lists the available products', async ({ signedInInventory: inventory }) => {
    await expect(inventory.products).toHaveCount(6);
    await expect(inventory.product(backpack).price).toHaveText('$29.99');
  });

  test('adding a product shows it in the cart badge', async ({
    signedInInventory: inventory,
    appHeader,
  }) => {
    const card = inventory.product(backpack);

    await card.addToCart();

    await expect(appHeader.cartBadge).toHaveText('1');
    await expect(card.removeButton).toBeVisible();
  });

  test('removing a product empties the cart badge', async ({
    signedInInventory: inventory,
    appHeader,
  }) => {
    const card = inventory.product(backpack);
    await card.addToCart();

    await card.removeFromCart();

    await expect(appHeader.cartBadge).toBeHidden();
    await expect(card.addToCartButton).toBeVisible();
  });

  test('opening the cart navigates to the cart page', async ({
    page,
    signedInInventory,
    appHeader,
  }) => {
    void signedInInventory;
    await appHeader.openCart();

    await expect(page).toHaveURL(/cart\.html/);
  });

  test('user can log out from the header menu', async ({
    page,
    signedInInventory,
    appHeader,
    loginPage,
  }) => {
    void signedInInventory;
    await appHeader.logout();

    await expect(page).not.toHaveURL(/inventory\.html/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
