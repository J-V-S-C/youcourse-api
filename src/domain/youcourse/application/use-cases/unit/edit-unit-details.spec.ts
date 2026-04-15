import { InMemoryUnitsRepository } from 'test/repositories/in-memory-units-repository';
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository';
import { EditUnitDetailsUseCase } from './edit-unit-details';
import { Course } from 'src/domain/youcourse/enterprise/entities/course';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { NotAllowedError } from '../errors/not-allowed-error';

let inMemoryUnitsRepository: InMemoryUnitsRepository;
let inMemoryCoursesRepository: InMemoryCoursesRepository;
let sut: EditUnitDetailsUseCase;

describe('Edit Unit Details', () => {
  let courseId: UniqueEntityID;
  let unitId: UniqueEntityID;
  let creatorId: UniqueEntityID;

  beforeEach(() => {
    inMemoryUnitsRepository = new InMemoryUnitsRepository();
    inMemoryCoursesRepository = new InMemoryCoursesRepository();
    sut = new EditUnitDetailsUseCase(
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
        name: 'Original Unit Name',
        description: 'Original description',
      },
      unitId,
    );

    inMemoryUnitsRepository.create(unit);
  });

  it('should be able to edit unit name', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Updated Unit Name',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedUnit = await inMemoryUnitsRepository.findById(
        unitId.toString(),
      );
      expect(updatedUnit?.name).toBe('Updated Unit Name');
      expect(updatedUnit?.description).toBe('Original description');
    }
  });

  it('should be able to edit unit description', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
      name: 'Updated Unit Name',
      description: 'Updated description',
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedUnit = await inMemoryUnitsRepository.findById(
        unitId.toString(),
      );
      expect(updatedUnit?.name).toBe('Updated Unit Name');
      expect(updatedUnit?.description).toBe('Updated description');
    }
  });

  it('should not update if name is not provided', async () => {
    const originalUnit = await inMemoryUnitsRepository.findById(
      unitId.toString(),
    );
    const originalName = originalUnit?.name;

    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: unitId.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const updatedUnit = await inMemoryUnitsRepository.findById(
        unitId.toString(),
      );
      expect(updatedUnit?.name).toBe(originalName);
    }
  });

  it('should not allow editing non-existent unit', async () => {
    const result = await sut.execute({
      creatorId: creatorId.toString(),
      unitId: 'non-existent-id',
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
      unitId: unitId.toString(),
      name: 'Updated Name',
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
    }
  });
});
