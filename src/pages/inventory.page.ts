import type { Locator, Page } from '@playwright/test';
import { ProductCard } from '../components/product-card.component';

/** The product list shown after login. */
export class InventoryPage {
  readonly products: Locator;

  constructor(private readonly page: Page) {
    this.products = page.getByTestId('inventory-item');
  }

  /** The card for the product with exactly this name. */
  product(name: string): ProductCard {
    const root = this.products.filter({ has: this.page.getByText(name, { exact: true }) });
    return new ProductCard(root);
  }
}
