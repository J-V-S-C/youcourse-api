import { Entity } from 'src/core/entities/entity';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Optional } from 'src/core/types/optional';

export interface UnitProps {
  courseId: UniqueEntityID;
  name: string;
  description?: string;
  position: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export class Unit extends Entity<UnitProps> {
  get courseId() {
    return this.props.courseId;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get position() {
    return this.props.position;
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

  updateDetails(name: string, description?: string | null) {
    this.props.name = name;
    if (description === null) {
      this.props.description = undefined;
    } else if (description !== undefined) {
      this.props.description = description;
    }
    this.touch();
  }

  reorder(position: number) {
    this.props.position = position;
    this.touch();
  }

  static create(
    props: Optional<UnitProps, 'createdAt' | 'position'>,
    id?: UniqueEntityID,
  ) {
    const unit = new Unit(
      {
        ...props,
        position: props.position ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
    return unit;
  }
}
