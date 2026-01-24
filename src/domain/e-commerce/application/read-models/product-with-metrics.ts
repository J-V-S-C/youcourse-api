import { Product } from '../../enterprise/entities/product';
import { ProductMetrics } from '../../enterprise/entities/product-metrics';

export interface ProductWithMetrics {
  product: Product;
  metrics: ProductMetrics;
  score: number;
}
