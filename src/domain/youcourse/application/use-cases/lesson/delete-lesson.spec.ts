import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { InMemoryVideoService } from 'test/services/in-memory-video-service';
import { DeleteLessonUseCase } from './delete-lesson';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let inMemoryVideoService: InMemoryVideoService;
let sut: DeleteLessonUseCase;

describe('Delete Lesson', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let lessonId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    inMemoryVideoService = new InMemoryVideoService();
    sut = new DeleteLessonUseCase(
      inMemoryLessonsRepository,
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
      inMemoryVideoService,
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
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);
  });

  it('should be able to delete a lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    expect(inMemoryLessonsRepository.items).toHaveLength(0);
  });

  it('should not allow deleting non-existent lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: 'non-existent-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow deleting if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });

  it('should not delete the unit, only the lesson', async () => {
    await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(inMemoryLessonsRepository.items).toHaveLength(0);
    expect(inMemoryUnitsRepository.items).toHaveLength(1);
  });
});
