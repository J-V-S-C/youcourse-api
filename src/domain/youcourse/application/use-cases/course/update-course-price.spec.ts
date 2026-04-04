import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { UpdateCoursePriceUseCase } from './update-course-price';
import { makeCourse } from 'test/factories/make-course';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';
import { Price } from 'src/domain/youcourse/enterprise/entities/value-objects/price';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: UpdateCoursePriceUseCase;

describe('Update Course Price', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new UpdateCoursePriceUseCase(inMemoryCoursesRepository);
  });

  it('should be able to update the course price', async () => {
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

    const updatedCourse = inMemoryCoursesRepository.items[0];
    expect(updatedCourse.price).toMatchObject(
      expect.objectContaining({
        amount: 10,
        currency: 'USD',
      }),
    );
  });
  it('should not be able to update the course price when course does not exist', async () => {
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

  it('should not be able to update a course price with invalid owner-id', async () => {
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

  it('should not be able to update a course price when course is sellable', async () => {
    const course = makeCourse();
    course.publish();
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
