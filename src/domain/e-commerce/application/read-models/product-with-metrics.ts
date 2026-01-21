import { Product } from '../../enterprise/entities/product';
import { ProductMetrics } from '../../enterprise/entities/value-objects/product-metrics';

export interface ProductWithMetrics {
  product: Product;
  metrics: ProductMetrics;
  score: number;
}
