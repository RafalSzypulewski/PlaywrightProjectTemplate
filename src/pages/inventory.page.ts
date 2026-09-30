import type { Locator, Page } from '@playwright/test';
import { ProductCard } from '../components/product-card.component';

/** The product list shown after login. Requires an authenticated session. */
export class InventoryPage {
  readonly products: Locator;

  constructor(private readonly page: Page) {
    this.products = page.getByTestId('inventory-item');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /** The card for the product with exactly this name. */
  product(name: string): ProductCard {
    const root = this.products.filter({ has: this.page.getByText(name, { exact: true }) });
    return new ProductCard(root);
  }
}
