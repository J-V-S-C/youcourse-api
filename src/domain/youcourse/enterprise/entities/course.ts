import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Price } from './value-objects/price';
import { Optional } from 'src/core/types/optional';
import { Rating } from './rating';
import type { Unit } from './unit';

export interface CourseProps {
  creatorId: UniqueEntityID;
  name: string;
  description: string;
  price?: Price;
  visible: boolean;
  sellable: boolean;
  units: Unit[];
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Course extends Entity<CourseProps> {
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

  get visible() {
    return this.props.visible;
  }

  get sellable() {
    return this.props.sellable;
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

  publish() {
    if (!this.props.price) {
      throw new Error('You can not publish a course without specify a price');
    }

    this.props.visible = true;
    this.props.sellable = true;
    this.touch();
  }

  unpublish() {
    this.props.sellable = false;
    this.touch();
  }

  hide() {
    this.props.visible = false;
    this.props.sellable = false;
    this.touch();
  }

  updateDetails(name: string, description: string) {
    this.props.name = name;
    this.props.description = description;
    this.touch();
  }

  updatePrice(price: Price) {
    if (this.sellable) {
      throw new Error('Cannot edit details of a sellable course');
    }

    this.props.price = price;
    this.touch();
  }

  static create(
    props: Optional<CourseProps, 'createdAt' | 'visible' | 'sellable' | 'units'>,
    id?: UniqueEntityID,
  ) {
    if (props.sellable && !props.price) {
      throw new Error('Sellable course must have price');
    }

    const course = new Course(
      {
        ...props,
        visible: props.visible ?? false,
        sellable: props.sellable ?? false,
        units: props.units ?? [],
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
    return course;
  }
}
