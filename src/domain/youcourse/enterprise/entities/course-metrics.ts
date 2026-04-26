import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

export interface CourseMetricsProps {
  courseId: UniqueEntityID;
  views: number;
  clicks: number;
  sales: number;
  updatedAt: Date;
}

export class CourseMetrics extends Entity<CourseMetricsProps> {
  get courseId() {
    return this.props.courseId;
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

  static create(props: CourseMetricsProps) {
    if (props.views < 0) throw new Error('Invalid views');
    if (props.clicks < 0) throw new Error('Invalid clicks');
    if (props.sales < 0) throw new Error('Invalid sales');

    return new CourseMetrics({
      ...props,
      updatedAt: props.updatedAt ?? new Date(),
    });
  }
}
