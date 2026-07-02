import { beforeEach, describe, expect, it } from 'vitest';
import { VerifyCourseAccessUseCase } from './verify-course-access';
import { InMemoryEnrollmentsRepository } from 'test/repositories/in-memory-enrollments-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryEnrollmentsRepository: InMemoryEnrollmentsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: VerifyCourseAccessUseCase;

describe('Verify Course Access Use Case', () => {
  beforeEach(() => {
    inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new VerifyCourseAccessUseCase(
      inMemoryEnrollmentsRepository,
      inMemoryCoursesRepository,
    );
  });

  it('should be able to verify and grant course access to an enrolled student', async () => {
    const course = Course.create(
      {
        creatorId: new UniqueEntityID('creator-1'),
        name: 'Clean Architecture with NestJS',
        description: 'Advanced software design',
        price: Price.create({ amount: 1000, currency: 'BRL' }),
        visible: true,
        sellable: true,
        units: [],
      },
      new UniqueEntityID('course-1'),
    );

    await inMemoryCoursesRepository.create(course);

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
  });

  it('should not be able to verify access if the course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'non-existing-course-id',
      accountId: 'student-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to grant access if the student is not enrolled in the course', async () => {
    const course = Course.create(
      {
        creatorId: new UniqueEntityID('creator-1'),
        name: 'DDD Foundations',
        description: 'Domain-Driven Design basics',
        price: Price.create({ amount: 1000, currency: 'BRL' }),
        visible: true,
        sellable: true,
        units: [],
      },
      new UniqueEntityID('course-1'),
    );

    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      courseId: 'course-1',
      accountId: 'not-enrolled-student-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
