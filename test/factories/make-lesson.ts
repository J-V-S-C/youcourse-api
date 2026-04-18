import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Lesson, LessonProps } from 'src/domain/youcourse/enterprise/entities/lesson';
import { faker } from '@faker-js/faker';

export function makeLesson(
  override: Partial<LessonProps> = {},
  id?: UniqueEntityID,
) {
  const lesson = Lesson.create(
    {
      unitId: new UniqueEntityID(),
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      video: null,
      position: faker.number.int({ min: 0, max: 10 }),
      isPreview: false,
      ...override,
    },
    id,
  );

  return lesson;
}