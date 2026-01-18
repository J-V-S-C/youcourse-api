import { PaginationParams } from 'src/core/repositories/pagination-params';
import { Product } from '../../enterprise/entities/product';

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<void>;
  abstract save(product: Product): Promise<void>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findMany(params: PaginationParams): Promise<Product[]>;
  abstract delete(product: Product): Promise<void>;
}
