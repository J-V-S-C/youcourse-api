import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { PublishCourseUseCase } from './publish-course';
import { makeCourse } from 'test/factories/make-course';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: PublishCourseUseCase;

describe('Publish Course', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new PublishCourseUseCase(inMemoryCoursesRepository);
  });

  it('should be able to publish a course', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: course.creatorId.toString(),
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isRight()).toBeTruthy();

    const savedCourse = inMemoryCoursesRepository.items[0];
    expect(savedCourse.price).toEqual(
      expect.objectContaining({
        amount: 10,
        currency: 'USD',
      }),
    );
  });

  it('should not be able to publish a non existent course', async () => {
    const result = await sut.execute({
      courseId: 'fake-id',
      creatorId: 'fake-creator',
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to publish a course with invalid creator-id', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: 'fake-creator',
      price: Price.create({
        amount: 10,
        currency: 'USD',
      }),
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
