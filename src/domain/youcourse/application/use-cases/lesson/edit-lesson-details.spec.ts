import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { EditLessonDetailsUseCase } from './edit-lesson-details';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: EditLessonDetailsUseCase;

describe('Edit Lesson Details', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let lessonId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new EditLessonDetailsUseCase(
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
        name: 'Original Lesson Name',
        description: 'Original description',
        isPreview: false,
      },
      lessonId,
    );

    inMemoryLessonsRepository.create(lesson);
  });

  it('should be able to edit lesson name', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
      name: 'Updated Lesson Name',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.name).toBe('Updated Lesson Name');
    }
  });

  it('should be able to edit lesson description', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
      name: 'Updated Lesson Name',
      description: 'Updated description',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.name).toBe('Updated Lesson Name');
      expect(updatedLesson?.description).toBe('Updated description');
    }
  });

  it('should be able to set lesson as preview', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
      isPreview: true,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.isPreview).toBe(true);
    }
  });

  it('should not update if name is not provided', async () => {
    const originalLesson = await inMemoryLessonsRepository.findById(
      lessonId.toString(),
    );
    const originalName = originalLesson?.name;

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: lessonId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedLesson = await inMemoryLessonsRepository.findById(
        lessonId.toString(),
      );
      expect(updatedLesson?.name).toBe(originalName);
    }
  });

  it('should not allow editing non-existent lesson', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      lessonId: 'non-existent-id',
      name: 'Updated Name',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow editing if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      lessonId: lessonId.toString(),
      name: 'Updated Name',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});
