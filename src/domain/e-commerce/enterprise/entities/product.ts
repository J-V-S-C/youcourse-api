import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Money } from './value-objects/money';
import { Optional } from 'src/core/types/optional';

export interface ProductProps {
  creatorId: UniqueEntityID;
  name: string;
  description: string;
  price: Money;
  available: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Product extends Entity<ProductProps> {
  get creatorId() {
    return this.props.creatorId;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get price() {
    return this.props.price;
  }

  get available() {
    return this.props.available;
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

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  set description(description: string) {
    this.props.description = description;
    this.touch();
  }

  set price(price: Money) {
    this.props.price = price;
    this.touch();
  }

  set available(available: boolean) {
    this.props.available = available;
    this.touch();
  }

  static create(
    props: Optional<ProductProps, 'createdAt' | 'available'>,
    id?: UniqueEntityID,
  ) {
    const product = new Product(
      {
        ...props,
        available: props.available ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
    return product;
  }
}
