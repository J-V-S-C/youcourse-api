import { InMemoryLessonsRepository } from 'test/repositories/in-memory-lessons-repository';
import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { FetchLessonsUseCase } from './fetch-lessons';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { makeCourse } from 'test/factories/make-course';
import { Video } from 'src/domain/youcourse/enterprise/entities/value-objects/video.vo';

let inMemoryLessonsRepository: InMemoryLessonsRepository;
let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: FetchLessonsUseCase;

describe('Fetch Lessons', () => {
  let unitId: UniqueEntityID;
  let creatorId: UniqueEntityID;
  let courseId: UniqueEntityID;

  beforeEach(() => {
    inMemoryLessonsRepository = new InMemoryLessonsRepository();
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();

    sut = new FetchLessonsUseCase(
      inMemoryLessonsRepository,
      inMemoryUnitsRepository,
      inMemoryCoursesRepository, // Injeção do CoursesRepository adicionada
    );

    creatorId = new UniqueEntityID();
    courseId = new UniqueEntityID();
    unitId = new UniqueEntityID();

    // Necessário criar o Course para o UseCase conseguir validar a relação
    const course = makeCourse({ creatorId }, courseId);
    inMemoryCoursesRepository.create(course);

    const unit = Unit.create(
      {
        courseId,
        name: 'Test Unit',
        description: 'Test description',
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);
  });

  it('should return empty array when unit has no lessons', async () => {
    const result = await sut.execute({
      unitId: unitId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lessons).toHaveLength(0);
    }
  });

  it('should return all lessons for a unit', async () => {
    const lesson1Id = new UniqueEntityID();
    const lesson2Id = new UniqueEntityID();
    const lesson3Id = new UniqueEntityID();

    const lesson1 = Lesson.create(
      { unitId, name: 'Lesson 1', position: 2 },
      lesson1Id,
    );
    const lesson2 = Lesson.create(
      { unitId, name: 'Lesson 2', position: 0 },
      lesson2Id,
    );
    const lesson3 = Lesson.create(
      { unitId, name: 'Lesson 3', position: 1 },
      lesson3Id,
    );

    await inMemoryLessonsRepository.create(lesson1);
    await inMemoryLessonsRepository.create(lesson2);
    await inMemoryLessonsRepository.create(lesson3);

    const result = await sut.execute({
      unitId: unitId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lessons).toHaveLength(3);
      expect(result.value.lessons[0].name).toBe('Lesson 2');
      expect(result.value.lessons[1].name).toBe('Lesson 3');
      expect(result.value.lessons[2].name).toBe('Lesson 1');
    }
  });

  it('should not return lessons from other units', async () => {
    const otherUnitId = new UniqueEntityID();
    const otherUnit = Unit.create(
      { courseId, name: 'Other Unit', description: 'Other description' },
      otherUnitId,
    );

    inMemoryUnitsRepository.create(otherUnit);

    const unitLesson = Lesson.create(
      { unitId, name: 'Unit Lesson' },
      new UniqueEntityID(),
    );
    const otherLesson = Lesson.create(
      { unitId: otherUnitId, name: 'Other Unit Lesson' },
      new UniqueEntityID(),
    );

    await inMemoryLessonsRepository.create(unitLesson);
    await inMemoryLessonsRepository.create(otherLesson);

    const result = await sut.execute({
      unitId: unitId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lessons).toHaveLength(1);
      expect(result.value.lessons[0].name).toBe('Unit Lesson');
    }
  });

  it('should return error for non-existent unit', async () => {
    const result = await sut.execute({
      unitId: 'non-existent-id',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe('Unit not found.');
    }
  });

  it('should remove video from non-preview lessons if user is not the creator', async () => {
    const videoObj = Video.createReady({
      externalId: '123',
      playbackUrl: 'url',
    });

    const lessonPreview = Lesson.createWithVideo({
      unitId,
      name: 'Preview',
      video: videoObj,
      isPreview: true,
      position: 0,
    });

    const lessonLocked = Lesson.createWithVideo({
      unitId,
      name: 'Locked',
      video: videoObj,
      isPreview: false,
      position: 1,
    });

    await inMemoryLessonsRepository.create(lessonPreview);
    await inMemoryLessonsRepository.create(lessonLocked);

    const result = await sut.execute({
      unitId: unitId.toString(),
      accountId: 'different-user-id',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lessons[0].video).not.toBeNull(); // Preview preservado
      expect(result.value.lessons[1].video).toBeNull(); // Locked removido
    }
  });

  it('should keep video from all lessons if user is the creator', async () => {
    const videoObj = Video.createReady({
      externalId: '123',
      playbackUrl: 'url',
    });

    const lessonLocked = Lesson.createWithVideo({
      unitId,
      name: 'Locked',
      video: videoObj,
      isPreview: false,
    });

    await inMemoryLessonsRepository.create(lessonLocked);

    const result = await sut.execute({
      unitId: unitId.toString(),
      accountId: creatorId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.lessons[0].video).not.toBeNull();
    }
  });
});
