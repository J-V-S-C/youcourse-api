import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Course,
  CourseProps,
} from 'src/domain/youcourse/enterprise/entities/course';
import { faker } from '@faker-js/faker';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

export function makeCourse(
  override: Partial<CourseProps> = {},
  id?: UniqueEntityID,
) {
  const course = Course.create(
    {
      name: faker.person.firstName(),
      description: faker.commerce.productDescription(),
      price: Price.create({
        amount: faker.number.float({ min: 0.01, fractionDigits: 2 }),
        currency: faker.finance.currencyCode(),
      }),
      creatorId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return course;
}
