import { Prisma, Course as PrismaCourse } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Course } from 'src/domain/ecommerce/enterprise/entities/course';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';

export class PrismaCourseMapper {
  static toDomain(raw: PrismaCourse): Course {
    return Course.create(
      {
        name: raw.name,
        description: raw.description,
        creatorId: new UniqueEntityID(raw.creatorId),
        price: raw.price
          ? Price.create(raw.price as { amount: number; currency: string })
          : undefined,
        sellable: raw.sellable,
        visible: raw.visible,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(course: Course): Prisma.CourseUncheckedCreateInput {
    return {
      id: course.id.toString(),
      name: course.name,
      description: course.description,
      creatorId: course.creatorId.toString(),
      price: course.price ? course.price?.toJSON() : Prisma.JsonNull,
      sellable: course.sellable,
      visible: course.visible,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
