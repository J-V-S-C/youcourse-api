import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteEnrollmentUseCase } from './delete-enrollment';
import { InMemoryEnrollmentsRepository } from 'test/repositories/in-memory-enrollments-repository';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryEnrollmentsRepository: InMemoryEnrollmentsRepository;
let sut: DeleteEnrollmentUseCase;

describe('Delete Enrollment Use Case', () => {
  beforeEach(() => {
    inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
    sut = new DeleteEnrollmentUseCase(inMemoryEnrollmentsRepository);
  });

  it('should be able to delete an existing enrollment', async () => {
    const enrollment = Enrollment.create({
      studentId: new UniqueEntityID('student-1'),
      courseId: new UniqueEntityID('course-1'),
    });

    await inMemoryEnrollmentsRepository.create(enrollment);

    const result = await sut.execute({
      courseId: 'course-1',
      accountId: 'student-1',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryEnrollmentsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete an enrollment if it does not exist', async () => {
    const result = await sut.execute({
      courseId: 'non-existing-course',
      accountId: 'student-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
