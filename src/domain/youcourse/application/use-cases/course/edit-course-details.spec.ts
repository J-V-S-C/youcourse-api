import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { EditCourseDetailsUseCase } from './edit-course-details';
import { makeCourse } from 'test/factories/make-course';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: EditCourseDetailsUseCase;

describe('Edit Course Details', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new EditCourseDetailsUseCase(inMemoryCoursesRepository);
  });

  it('should be able to edit the course details', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: course.creatorId.toString(),
      name: 'new name',
      description: 'new description',
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryCoursesRepository.items[0]).toMatchObject({
      name: 'new name',
      description: 'new description',
    });
  });
  it('should not be able to edit a non existent course', async () => {
    const result = await sut.execute({
      courseId: 'fake-id',
      creatorId: 'fake-creator',
      name: 'new name',
      description: 'new description',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to edit a course with invalid owner-id', async () => {
    const course = makeCourse();
    inMemoryCoursesRepository.items.push(course);

    const result = await sut.execute({
      courseId: course.id.toString(),
      creatorId: 'fake-creator',
      name: 'new name',
      description: 'new description',
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
