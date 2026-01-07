import { ProductsRepository } from 'src/domain/e-commerce/application/repositories/products-repository';
import { Product } from 'src/domain/e-commerce/enterprise/entities/product';

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = [];

  async create(product: Product): Promise<void> {
    this.items.push(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((product) => product.id.toString() === id) ?? null;
  }

  async save(product: Product): Promise<void> {
    this.items.find((itemsProduct) => {
      if (itemsProduct.id === product.id) {
        itemsProduct = product;
      }
    });
  }
}
