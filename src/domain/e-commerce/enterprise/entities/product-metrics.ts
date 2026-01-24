import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

export interface ProductMetricsProps {
  productId: UniqueEntityID;
  views: number;
  clicks: number;
  sales: number;
  updatedAt: Date;
}

export class ProductMetrics extends Entity<ProductMetricsProps> {
  get productId() {
    return this.props.productId;
  }

  get views() {
    return this.props.views;
  }

  get clicks() {
    return this.props.clicks;
  }

  get sales() {
    return this.props.sales;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  incrementViews() {
    this.props.views++;
    this.touch();
  }

  incrementClicks() {
    this.props.clicks++;
    this.touch();
  }

  incrementSales() {
    this.props.sales++;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(props: ProductMetricsProps) {
    if (props.views < 0) throw new Error('Invalid views');
    if (props.clicks < 0) throw new Error('Invalid clicks');
    if (props.sales < 0) throw new Error('Invalid sales');

    return new ProductMetrics({
      ...props,
      updatedAt: props.updatedAt ?? new Date(),
    });
  }
}
