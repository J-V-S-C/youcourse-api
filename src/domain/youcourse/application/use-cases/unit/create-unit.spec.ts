import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { CreateUnitUseCase } from './create-unit';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: CreateUnitUseCase;

describe('Create Unit', () => {
  beforeEach(() => {
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new CreateUnitUseCase(
      inMemoryUnitsRepository,
      inMemoryCoursesRepository,
    );
  });

  it('should be able to create a new unit', async () => {
    const creatorId = new UniqueEntityID();
    const courseId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      courseId: courseId.toString(),
      name: 'Introduction',
      description: 'Introduction to the course',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUnitsRepository.items).toHaveLength(1);
      expect(result.value.unit.name).toBe('Introduction');
      expect(result.value.unit.description).toBe('Introduction to the course');
    }
  });

  it('should set position based on existing units', async () => {
    const creatorId = new UniqueEntityID();
    const courseId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    await inMemoryCoursesRepository.create(course);

    await sut.execute({
      creatorId: creatorId.toString(),
      courseId: courseId.toString(),
      name: 'Unit 1',
    });

    await sut.execute({
      creatorId: creatorId.toString(),
      courseId: courseId.toString(),
      name: 'Unit 2',
    });

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      courseId: courseId.toString(),
      name: 'Unit 3',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.unit.position).toBe(2);
    }
  });

  it('should use provided position if specified', async () => {
    const creatorId = new UniqueEntityID();
    const courseId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      courseId: courseId.toString(),
      name: 'Unit at position 5',
      position: 5,
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.unit.position).toBe(5);
    }
  });

  it('should not allow creating unit for non-existent course', async () => {
    const result = await sut.execute({
      creatorId: 'any-creator',
      courseId: 'non-existent-course',
      name: 'Unit',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    }
  });

  it('should not allow creating unit if user is not the course creator', async () => {
    const creatorId = new UniqueEntityID();
    const differentUserId = new UniqueEntityID();
    const courseId = new UniqueEntityID();

    const course = Course.create(
      {
        creatorId,
        name: 'Test Course',
        description: 'Test description',
      },
      courseId,
    );

    await inMemoryCoursesRepository.create(course);

    const result = await sut.execute({
      creatorId: differentUserId.toString(),
      courseId: courseId.toString(),
      name: 'Unit',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});
