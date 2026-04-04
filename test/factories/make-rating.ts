import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Rating,
  RatingProps,
} from 'src/domain/youcourse/enterprise/entities/rating';
import { faker } from '@faker-js/faker';
import { Stars } from 'src/domain/youcourse/enterprise/entities/value-objects/stars';

export function makeRating(
  override: Partial<RatingProps> = {},
  id?: UniqueEntityID,
) {
  const rating = Rating.create(
    {
      creatorId: new UniqueEntityID(),
      courseId: new UniqueEntityID(),
      commentary: faker.lorem.text(),
      stars: Stars.create(faker.number.int({ min: 1, max: 10 }) / 2),
      ...override,
    },
    id,
  );

  return rating;
}
