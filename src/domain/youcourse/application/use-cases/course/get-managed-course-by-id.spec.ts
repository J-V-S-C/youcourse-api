import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { GetManagedCourseByIdUseCase } from './get-managed-course-by-id';
import { makeCourse } from 'test/factories/make-course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: GetManagedCourseByIdUseCase;

describe('Get Managed Course By Id Use Case', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new GetManagedCourseByIdUseCase(inMemoryCoursesRepository);
  });
  it('should not be able to get course details if requester is not the owner of a visible course', async () => {
    const creatorId = new UniqueEntityID('owner-01');
    const newCourse = makeCourse(
      { creatorId, visible: true },
      new UniqueEntityID('course-01'),
    );
    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'attacker-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return ResourceNotFoundError if non-owner tries to access a hidden course', async () => {
    const creatorId = new UniqueEntityID('owner-01');
    const newCourse = makeCourse(
      { creatorId, visible: false },
      new UniqueEntityID('course-01'),
    );
    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'attacker-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
