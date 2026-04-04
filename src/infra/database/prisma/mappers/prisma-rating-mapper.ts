import { Prisma, Rating as PrismaRating } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Rating } from 'src/domain/ecommerce/enterprise/entities/rating';
import { Price } from 'src/domain/ecommerce/enterprise/entities/value-objects/price';
import { Stars } from 'src/domain/ecommerce/enterprise/entities/value-objects/stars';

export class PrismaRatingMapper {
  static toDomain(raw: PrismaRating): Rating {
    return Rating.create(
      {
        stars: Stars.create(raw.stars),
        commentary: raw.commentary,
        creatorId: new UniqueEntityID(raw.creatorId),
        courseId: new UniqueEntityID(raw.courseId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(rating: Rating): Prisma.RatingUncheckedCreateInput {
    return {
      id: rating.id.toString(),
      stars: rating.stars.value,
      commentary: rating.commentary,
      creatorId: rating.creatorId.toString(),
      courseId: rating.courseId.toString(),
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }
}
