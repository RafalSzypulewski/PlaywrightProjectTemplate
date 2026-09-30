import { expect, type Locator, type Page } from '@playwright/test';

/** Header shown on every authenticated page: cart entry point and the account menu. */
export class AppHeader {
  readonly cartLink: Locator;
  /** Only rendered while the cart is not empty. */
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutButton: Locator;

  /** The header of the current page. */
  static of(page: Page): AppHeader {
    return new AppHeader(page.getByTestId('primary-header'));
  }

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
    // Right after the first render the menu can ignore the open click or close again by itself
    // (seen in WebKit under load). Retry the whole open-and-click sequence rather than waiting
    // blindly; open only while the menu is closed so a retry cannot toggle an open menu shut.
    await expect(async () => {
      if (!(await this.logoutButton.isVisible())) await this.menuButton.click();
      await this.logoutButton.click({ timeout: 5_000 });
    }).toPass({ timeout: 20_000 });
  }
}
