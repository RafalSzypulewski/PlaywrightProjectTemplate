import { expect, test } from '@playwright/test';
import { LoginPage, type Credentials } from '../src/pages/login.page';

// Public demo credentials published by the demo application. Real projects read
// credentials from env or a data factory, never hardcode them here.
const validUser: Credentials = { username: 'standard_user', password: 'secret_sauce' };
const lockedOutUser: Credentials = { username: 'locked_out_user', password: 'secret_sauce' };

test.describe('login', { tag: '@smoke' }, () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('user with valid credentials reaches the product list', async ({ page }) => {
    await loginPage.login(validUser);

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('locked out user sees an error and stays on the login page', async ({ page }) => {
    await loginPage.login(lockedOutUser);

    await expect(loginPage.errorMessage).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password is rejected', async () => {
    await loginPage.login({ ...validUser, password: 'wrong-password' });

    await expect(loginPage.errorMessage).toContainText('do not match');
  });
});
