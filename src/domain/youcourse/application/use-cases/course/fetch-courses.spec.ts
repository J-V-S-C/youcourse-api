import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { FetchCoursesUseCase } from './fetch-courses';
import { makeCourse } from 'test/factories/make-course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { CourseMetrics } from 'src/domain/youcourse/enterprise/entities/course-metrics';

let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: FetchCoursesUseCase;

describe('Fetch Course', () => {
  beforeEach(() => {
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new FetchCoursesUseCase(inMemoryCoursesRepository);
  });

  it('should be able to fetch recent courses', async () => {
    inMemoryCoursesRepository.create(
      makeCourse({
        createdAt: new Date(2026, 0, 20),
        visible: true,
      }),
    );

    inMemoryCoursesRepository.create(
      makeCourse({
        createdAt: new Date(2026, 1, 20),
        visible: true,
      }),
    );

    inMemoryCoursesRepository.create(
      makeCourse({
        createdAt: new Date(2026, 0, 19),
        visible: true,
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'recent',
    });

    expect(result.isRight()).toBeTruthy();
    expect(result.value?.visibleCourses).toEqual([
      expect.objectContaining({ createdAt: new Date(2026, 1, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 19) }),
    ]);
  });

  it('should fetch courses ordered by popularity', async () => {
    const p1 = makeCourse({ visible: true }, new UniqueEntityID('1'));
    const p2 = makeCourse({ visible: true }, new UniqueEntityID('2'));
    const p3 = makeCourse({ visible: true }, new UniqueEntityID('3'));

    await inMemoryCoursesRepository.create(p1);
    await inMemoryCoursesRepository.create(p2);
    await inMemoryCoursesRepository.create(p3);

    inMemoryCoursesRepository.metrics.set(
      '1',
      CourseMetrics.create({
        courseId: p2.id,
        views: 100,
        clicks: 2,
        sales: 0,
        updatedAt: new Date(),
      }),
    );

    inMemoryCoursesRepository.metrics.set(
      '2',
      CourseMetrics.create({
        courseId: p1.id,
        views: 10,
        clicks: 5,
        sales: 1,
        updatedAt: new Date(),
      }),
    );

    inMemoryCoursesRepository.metrics.set(
      '3',
      CourseMetrics.create({
        courseId: p3.id,
        views: 5,
        clicks: 1,
        sales: 3,
        updatedAt: new Date(),
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'popular',
    });

    expect(result.isRight()).toBe(true);
    expect(result.value!.visibleCourses.map((p) => p.id.toString())).toEqual([
      '3',
      '2',
      '1',
    ]);
  });

  it('should return courses ordered by best sales', async () => {
    const p1 = makeCourse({ visible: true }, new UniqueEntityID('1'));
    const p2 = makeCourse({ visible: true }, new UniqueEntityID('2'));
    const p3 = makeCourse({ visible: true }, new UniqueEntityID('3'));

    await inMemoryCoursesRepository.create(p1);
    await inMemoryCoursesRepository.create(p2);
    await inMemoryCoursesRepository.create(p3);

    inMemoryCoursesRepository.metrics.set(
      '1',
      CourseMetrics.create({
        courseId: p1.id,
        views: 0,
        clicks: 0,
        sales: 10,
        updatedAt: new Date(),
      }),
    );

    inMemoryCoursesRepository.metrics.set(
      '2',
      CourseMetrics.create({
        courseId: p2.id,
        views: 0,
        clicks: 0,
        sales: 3,
        updatedAt: new Date(),
      }),
    );

    inMemoryCoursesRepository.metrics.set(
      '3',
      CourseMetrics.create({
        courseId: p3.id,
        views: 0,
        clicks: 0,
        sales: 20,
        updatedAt: new Date(),
      }),
    );

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'bestSelling',
    });

    expect(result.value!.visibleCourses.map((p) => p.id.toString())).toEqual([
      '3',
      '1',
      '2',
    ]);
  });

  it('should return only visible courses', async () => {
    const visibleSellable = makeCourse({ visible: true, sellable: true });
    const visibleNotSellable = makeCourse({ visible: true, sellable: false });
    const hidden = makeCourse({ visible: false, sellable: true });

    await inMemoryCoursesRepository.create(visibleSellable);
    await inMemoryCoursesRepository.create(visibleNotSellable);
    await inMemoryCoursesRepository.create(hidden);

    const result = await sut.execute({
      page: 1,
      perPage: 10,
      orderBy: 'recent',
    });

    expect(result.value!.visibleCourses).toHaveLength(2);
    expect(result.value!.visibleCourses.every((p) => p.visible)).toBe(true);
  });
});
