import { describe, beforeEach, it, expect } from 'vitest';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryEnrollmentsRepository } from 'test/repositories/in-memory-enrollments-repository';
import { GetCourseByIdUseCase } from './get-course-by-id';
import { makeCourse } from 'test/factories/make-course';
import { Enrollment } from 'src/domain/youcourse/enterprise/entities/enrollment';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let inMemoryEnrollmentsRepository: InMemoryEnrollmentsRepository;
let sut: GetCourseByIdUseCase;

describe('Get Course By Id Use Case', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
    sut = new GetCourseByIdUseCase(
      inMemoryCoursesRepository,
      inMemoryEnrollmentsRepository,
    );
  });

  it('should be able to get a course by id (public view)', async () => {
    const newCourse = makeCourse(
      { visible: true },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.course.id.toString()).toBe('course-01');
    }
  });

  it('should be able to get a private course if the requester is the owner', async () => {
    const creatorId = new UniqueEntityID('creator-01');
    const newCourse = makeCourse(
      { creatorId, visible: false },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'creator-01',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should be able to get a private course if the requester is an enrolled student', async () => {
    const newCourse = makeCourse(
      { visible: false },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const enrollment = Enrollment.create({
      studentId: new UniqueEntityID('student-01'),
      courseId: newCourse.id,
    });

    await inMemoryEnrollmentsRepository.create(enrollment);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'student-01',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should not be able to get a private course if the requester is a student not enrolled', async () => {
    const newCourse = makeCourse(
      { visible: false },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'not-enrolled-student',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should be able to get a public course even if the user is a student not enrolled', async () => {
    const newCourse = makeCourse(
      { visible: true },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'random-student',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should return ResourceNotFoundError when the course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
