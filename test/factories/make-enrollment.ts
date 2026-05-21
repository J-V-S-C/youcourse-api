import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import {
  Enrollment,
  EnrollmentProps,
} from 'src/domain/youcourse/enterprise/entities/enrollment';
import { faker } from '@faker-js/faker';

export function makeEnrollment(
  override: Partial<EnrollmentProps> = {},
  id?: UniqueEntityID,
) {
  const enrollment = Enrollment.create(
    {
      studentId: new UniqueEntityID(),
      courseId: new UniqueEntityID(),
      enrolledAt: faker.date.recent(),
      ...override,
    },
    id,
  );

  return enrollment;
}
