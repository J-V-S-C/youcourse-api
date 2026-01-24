import { PaginationParams } from 'src/core/repositories/pagination-params';
import { ProductsRepository } from 'src/domain/e-commerce/application/repositories/products-repository';
import { Product } from 'src/domain/e-commerce/enterprise/entities/product';
import { ProductMetrics } from 'src/domain/e-commerce/enterprise/entities/product-metrics';

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = [];
  metrics: Map<string, ProductMetrics> = new Map();

  async create(product: Product): Promise<void> {
    this.items.push(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.items.find((product) => product.id.toString() === id) ?? null;
  }

  async findMany({
    page,
    perPage,
    orderBy,
  }: PaginationParams): Promise<Product[]> {
    const products = this.items
      .sort((a, b) => {
        switch (orderBy) {
          case 'recent':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'popular':
            return this.getScore(b) - this.getScore(a);
          case 'bestSelling':
            return this.getSales(b) - this.getSales(a);
          default:
            return 0;
        }
      })
      .slice((page - 1) * perPage, page * perPage);

    return products;
  }

  async save(product: Product): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === product.id);
    this.items[itemIndex] = product;
  }

  async delete(product: Product): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === product.id);
    this.items.splice(itemIndex, 1);
  }

  private getScore(product: Product): number {
    const metric = this.metrics.get(product.id.toString());
    if (!metric) return 0;
    return metric.sales * 5 + metric.clicks * 2 + metric.views * 0.1;
  }

  private getSales(product: Product): number {
    const metric = this.metrics.get(product.id.toString());
    if (!metric) return 0;
    return metric.sales;
  }
}
