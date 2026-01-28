import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';
import { Stars } from './value-objects/stars';

export interface RatingProps {
  creatorId: UniqueEntityID;
  productId: UniqueEntityID;
  commentary: string;
  stars: Stars;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Rating extends Entity<RatingProps> {
  get creatorId() {
    return this.props.creatorId;
  }

  get productId() {
    return this.props.productId;
  }

  get commentary() {
    return this.props.commentary;
  }

  get stars() {
    return this.props.stars;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  set commentary(commentary: string) {
    this.props.commentary = commentary;
    this.touch();
  }

  set stars(stars: Stars) {
    this.props.stars = stars;
    this.touch();
  }

  static create(
    props: Optional<RatingProps, 'createdAt' | 'commentary'>,
    id?: UniqueEntityID,
  ) {
    const rating = new Rating(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        commentary: props.commentary ?? '',
      },
      id,
    );
    return rating;
  }
}
