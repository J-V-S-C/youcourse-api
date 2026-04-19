import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { GetCourseByIdUseCase } from './get-course-by-id';
import { makeCourse } from 'test/factories/make-course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: GetCourseByIdUseCase;

describe('Get Course By Id Use Case', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new GetCourseByIdUseCase(inMemoryCoursesRepository);
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

  it('should not be able to get a private course if the requester is not the owner', async () => {
    const creatorId = new UniqueEntityID('creator-01');
    const newCourse = makeCourse(
      { creatorId, visible: false },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'not-the-owner',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return NotAllowedError when trying to manage a course without being the owner', async () => {
    const creatorId = new UniqueEntityID('creator-01');
    const newCourse = makeCourse(
      { creatorId, visible: true },
      new UniqueEntityID('course-01'),
    );

    await inMemoryCoursesRepository.create(newCourse);

    const result = await sut.execute({
      courseId: 'course-01',
      userId: 'hacker-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return ResourceNotFoundError when the course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'non-existing-id',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
