import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { ReorderLessonUseCase } from './reorder-lesson';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: ReorderLessonUseCase;

describe('Reorder Lesson', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let lessonId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new ReorderLessonUseCase(
      inMemoryLessonsRepository,
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();
    unitId = new UniqueEntityID();
    lessonId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    inMemoryCoursesRepository.create(course);

    const unit = Unit.create(
      {
        courseId,
        name: 'Test Unit',
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);

    const lesson = Lesson.createPending(
      {
        unitId,
        name: 'Test Lesson',
        position: 0,
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);
  });

  it('should be able to reorder a lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
      position: 10,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.position).toBe(10);
    }
  });

  it('should not allow reordering non-existent lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: 'non-existent-id',
      position: 5,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow reordering if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      lessonId: lessonId.toString(),
      position: 5,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});
