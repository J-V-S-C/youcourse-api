import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { HideCourseUseCase } from './hide-course';
import { makeCourse } from 'test/factories/make-course';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: HideCourseUseCase;

describe('Hide Course', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new HideCourseUseCase(inMemoryCoursesRepository);
  });

  it('should be able to hide a course', async () => {
    const course = makeCourse();
    course.publish();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: course.creatorId.toString(),
    });

    expect(result.isRight()).toBeTruthy();

    const savedCourse = inMemoryCoursesRepository.items[0];
    expect(savedCourse.sellable).toBeFalsy();
    expect(savedCourse.visible).toBeFalsy();
  });

  it('should not be able to hide a non existent course', async () => {
    const result = await sut.execute({
      courseId: 'fake-id',
      creatorId: 'fake-creator',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to hide a course with invalid creator-id', async () => {
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
