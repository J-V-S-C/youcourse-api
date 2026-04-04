import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { DeleteCourseUseCase } from './delete-course';
import { makeCourse } from 'test/factories/make-course';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: DeleteCourseUseCase;

describe('Delete Course', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new DeleteCourseUseCase(inMemoryCoursesRepository);
  });

  it('should be able to delete a course ', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: course.creatorId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryCoursesRepository.items).toHaveLength(0);
  });
  it('should not be able to delete a non existent course', async () => {
    const result = await sut.execute({
      courseId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to delete a course with invalid owner-id', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
