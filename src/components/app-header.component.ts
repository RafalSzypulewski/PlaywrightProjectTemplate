import type { Locator } from '@playwright/test';

/** Header shown on every authenticated page: cart entry point and the account menu. */
export class AppHeader {
  readonly cartLink: Locator;
  /** Only rendered while the cart is not empty. */
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutButton: Locator;

  constructor(root: Locator) {
    this.cartLink = root.getByRole('button', { name: /^Cart/ });
    this.cartBadge = root.getByTestId('shopping-cart-badge');
    this.menuButton = root.getByRole('button', { name: 'Open Menu' });
    this.logoutButton = root.getByRole('button', { name: 'Logout' });
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutButton.click();
  }
}
