import { expect, test } from '../src/fixtures';

test.describe('login', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('user with valid credentials reaches the product list', async ({
    page,
    loginPage,
    users,
  }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('locked out user sees an error and stays on the login page', async ({
    page,
    loginPage,
    users,
  }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.errorMessage).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password is rejected', async ({ loginPage, users }) => {
    await loginPage.login({ ...users.standard, password: 'wrong-password' });

    await expect(loginPage.errorMessage).toContainText('do not match');
  });
});
