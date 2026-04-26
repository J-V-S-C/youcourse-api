import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Unit, UnitProps } from 'src/domain/youcourse/enterprise/entities/unit';
import { faker } from '@faker-js/faker';

export function makeUnit(
  override: Partial<UnitProps> = {},
  id?: UniqueEntityID,
) {
  const unit = Unit.create(
    {
      courseId: new UniqueEntityID(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      position: faker.number.int({ min: 0, max: 10 }),
      ...override,
    },
    id,
  );

  return unit;
}