import type { Locator } from '@playwright/test';

/** One product tile in the inventory list. Scoped to its own root, so actions hit only this card. */
export class ProductCard {
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(private readonly root: Locator) {
    this.name = root.getByTestId('inventory-item-name');
    this.price = root.getByTestId('inventory-item-price');
    this.addToCartButton = root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = root.getByRole('button', { name: 'Remove' });
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }
}
