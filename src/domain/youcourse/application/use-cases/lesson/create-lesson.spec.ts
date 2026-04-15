import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { CreateLessonUseCase } from './create-lesson';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: CreateLessonUseCase;

describe('Create Lesson', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new CreateLessonUseCase(
      inMemoryLessonsRepository,
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();
    unitId = new UniqueEntityID();

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
  });

  it('should be able to create a new lesson without video', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Introduction Lesson',
      description: 'Introduction to the topic',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryLessonsRepository.items).toHaveLength(1);
      expect(result.value.lesson.name).toBe('Introduction Lesson');
      expect(result.value.lesson.description).toBe('Introduction to the topic');
      expect(result.value.lesson.video).toBeNull();
      expect(result.value.lesson.hasVideo).toBe(false);
    }
  });

  it('should set position based on existing lessons', async () => {
    await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Lesson 1',
    });

    await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Lesson 2',
    });

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Lesson 3',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lesson.position).toBe(2);
    }
  });

  it('should use provided position if specified', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Lesson at position 10',
      position: 10,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lesson.position).toBe(10);
    }
  });

  it('should create a preview lesson when isPreview is true', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Preview Lesson',
      isPreview: true,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lesson.isPreview).toBe(true);
    }
  });

  it('should not allow creating lesson for non-existent unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: 'non-existent-unit',
      name: 'Lesson',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow creating lesson if user is not the course creator', async () => {
    const differentUserId = new UniqueEntityID();

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      unitId: unitId.toString(),
      name: 'Lesson',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });

  it('should not allow creating lesson if unit course does not exist', async () => {
    const orphanUnitId = new UniqueEntityID();
    const orphanUnit = Unit.create(
      {
        courseId: new UniqueEntityID(),
        name: 'Orphan Unit',
      },
      orphanUnitId,
    );

    inMemoryUnitsRepository.create(orphanUnit);

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: orphanUnitId.toString(),
      name: 'Lesson',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });
});
