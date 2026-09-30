import type { Locator, Page } from '@playwright/test';
import { AppHeader } from '../components/app-header.component';
import { ProductCard } from '../components/product-card.component';

/** The product list shown after login. */
export class InventoryPage {
  readonly header: AppHeader;
  readonly products: Locator;

  constructor(private readonly page: Page) {
    this.header = new AppHeader(page.getByTestId('primary-header'));
    this.products = page.getByTestId('inventory-item');
  }

  /** The card for the product with exactly this name. */
  product(name: string): ProductCard {
    const root = this.products.filter({ has: this.page.getByText(name, { exact: true }) });
    return new ProductCard(root);
  }
}
