import { FetchEnrolledCoursesUseCase } from './fetch-enrolled-courses';
import { InMemoryEnrollmentsRepository } from 'test/repositories/in-memory-enrollments-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { makeEnrollment } from 'test/factories/make-enrollment';
import { makeCourse } from 'test/factories/make-course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';

let inMemoryEnrollmentsRepository: InMemoryEnrollmentsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: FetchEnrolledCoursesUseCase;

describe('Fetch Enrolled Courses', () => {
  beforeEach(() => {
    inMemoryEnrollmentsRepository = new InMemoryEnrollmentsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new FetchEnrolledCoursesUseCase(
      inMemoryEnrollmentsRepository,
      inMemoryCoursesRepository,
    );
  });

  it('should be able to fetch enrolled courses', async () => {
    const studentId = new UniqueEntityID('student-1');

    const course1 = makeCourse();
    const course2 = makeCourse();
    const course3 = makeCourse();

    await inMemoryCoursesRepository.create(course1);
    await inMemoryCoursesRepository.create(course2);
    await inMemoryCoursesRepository.create(course3);

    const enrollment1 = makeEnrollment({
      studentId,
      courseId: course1.id,
    });
    const enrollment2 = makeEnrollment({
      studentId,
      courseId: course2.id,
    });

    await inMemoryEnrollmentsRepository.create(enrollment1);
    await inMemoryEnrollmentsRepository.create(enrollment2);

    const result = await sut.execute({
      studentId: studentId.toString(),
      page: 1,
      perPage: 20,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.courses).toHaveLength(2);
      expect(result.value.courses).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: course1.id }),
          expect.objectContaining({ id: course2.id }),
        ]),
      );
    }
  });
});
